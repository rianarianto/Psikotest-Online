import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Head, router } from '@inertiajs/react';
import Swal from 'sweetalert2';

// Interface untuk struktur pertanyaan Kraepelin
interface Question {
    index: number;
    number_a: number;
    number_b: number;
    user_answer: number | null;
}

// Interface untuk ringkasan menit/session (tidak digunakan untuk display tapi bisa untuk tracking)
interface MinuteSummary {
    minute: number;
    answered: number;
    correct: number;
}

// Props yang diterima dari backend controller
interface Props {
    participant: {
        id: number;
        name: string;
    };
    testConfig: {
        totalMinutes: number;       // Total jumlah session (50)
        questionsPerMinute: number; // Max pertanyaan per session (100 = unlimited)
        durationMinutes: number;    // Total durasi tes dalam menit
    };
    currentMinute: number;          // Session saat ini dari backend (untuk sync awal)
    questions: Question[];          // Pertanyaan untuk session saat ini
    remainingSeconds: number;       // Sisa waktu session dari backend (untuk sync awal)
    startedAt: string | null;       // Waktu mulai tes
    minutesSummary: MinuteSummary[];
    initialQuestionIndex: number;   // Index pertanyaan untuk resume
    tokenExpiresAt: string | null;  // Waktu kadaluarsa token
    tokenRemainingSeconds: number;  // Sisa waktu token (detik)
}

// Konstanta durasi session dalam detik (harus sama dengan backend)
const SESSION_DURATION_SECONDS = 30;

export default function KraepelinTest({
    participant,
    testConfig,
    currentMinute: initialMinute,
    questions: initialQuestions,
    remainingSeconds: initialRemaining,
    startedAt,
    minutesSummary,
    initialQuestionIndex,
    tokenExpiresAt,
    tokenRemainingSeconds,
}: Props) {
    // State untuk tracking session dan pertanyaan
    const [currentMinute, setCurrentMinute] = useState(initialMinute || 1);
    const [questions, setQuestions] = useState<Question[]>(initialQuestions || []);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(initialQuestionIndex || 0);

    // Timer state - menggunakan waktu dari backend sebagai nilai awal
    const [minuteTimeLeft, setMinuteTimeLeft] = useState(initialRemaining || SESSION_DURATION_SECONDS);
    const [isTestFinished, setIsTestFinished] = useState(false);

    // Token expiration state
    const [tokenTimeLeft, setTokenTimeLeft] = useState(tokenRemainingSeconds);
    const isTokenExpiredRef = useRef(false);

    // Input state
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    // Ref untuk tracking jawaban yang perlu di-sync ke backend
    const pendingAnswersRef = useRef<Array<{
        minute_number: number;
        question_index: number;
        answer: number;
        number_a: number; // ADDED
        number_b: number; // ADDED
    }>>([]);

    // Flag untuk mencegah multiple session transitions
    const isTransitioningRef = useRef(false);

    // Prevent Back Button
    useEffect(() => {
        // Function to push state
        const pushState = () => {
            // We use a dummy state to ensure we have something to pop
            window.history.pushState({ noBack: true }, '', window.location.href);
        };

        pushState();

        const handlePopState = (event: PopStateEvent) => {
            // Prevent default behavior implies we stay on page
            // But popstate happens AFTER url change. 
            // We need to push state again to "undo" the back navigation visually
            pushState();

            Swal.fire({
                icon: 'warning',
                title: 'Peringatan',
                text: 'Anda sedang dalam sesi tes. Tidak diperbolehkan kembali.',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    // Effect untuk token expiration countdown dan auto-redirect
    useEffect(() => {
        // Strict initial check
        if (tokenRemainingSeconds <= 0 && !isTokenExpiredRef.current) {
            isTokenExpiredRef.current = true;
            handleTokenExpired();
            return;
        }

        const timer = setInterval(() => {
            setTokenTimeLeft(prev => {
                const newValue = Math.max(0, prev - 1);
                if (newValue <= 0 && !isTokenExpiredRef.current) {
                    isTokenExpiredRef.current = true;
                    handleTokenExpired();
                }
                return newValue;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleTokenExpired = () => {
        setIsTestFinished(true); // Stop test interactions

        Swal.fire({
            icon: 'error',
            title: 'Token Kadaluarsa',
            text: 'Waktu sesi token Anda telah habis. Tes dihentikan otomatis.',
            confirmButtonText: 'Keluar',
            allowOutsideClick: false,
            allowEscapeKey: false,
            customClass: {
                confirmButton: 'bg-red-600 hover:bg-red-700 text-white rounded-md px-4 py-2',
            },
            buttonsStyling: false,
        }).then(() => {
            // Force hard redirect
            window.location.href = '/';
        });
    };

    // Sync state hanya saat props berubah (halaman di-refresh)
    useEffect(() => {
        setCurrentMinute(initialMinute);
        setQuestions(initialQuestions);
        setCurrentQuestionIndex(initialQuestionIndex || 0);
        setMinuteTimeLeft(initialRemaining);
        setInputValue('');
    }, [initialMinute, initialQuestions, initialQuestionIndex, initialRemaining]);

    // Focus pada input saat question berubah
    useEffect(() => {
        inputRef.current?.focus();
    }, [currentQuestionIndex, currentMinute]);

    // Fungsi untuk generate pertanyaan baru untuk session berikutnya (lokal)
    const generateNewQuestions = useCallback((sessionNumber: number): Question[] => {
        const newQuestions: Question[] = [];
        const count = testConfig.questionsPerMinute;

        for (let i = 0; i < count; i++) {
            newQuestions.push({
                index: i,
                number_a: Math.floor(Math.random() * 9) + 1, // 1-9
                number_b: Math.floor(Math.random() * 9) + 1, // 1-9
                user_answer: null,
            });
        }
        return newQuestions;
    }, [testConfig.questionsPerMinute]);

    // Fungsi untuk sync jawaban ke backend (fire and forget)
    const syncAnswersToBackend = useCallback(async () => {
        const answers = [...pendingAnswersRef.current];
        if (answers.length === 0) return;

        // Clear pending answers immediately to prevent dupes
        pendingAnswersRef.current = [];

        // Sync each answer
        for (const ans of answers) {
            try {
                await fetch(route('psikotest.kraepelin-test.save-answer'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                    body: JSON.stringify({
                        participant_id: participant.id,
                        minute_number: ans.minute_number,
                        question_index: ans.question_index,
                        answer: ans.answer,
                        number_a: ans.number_a, // SENDING QUESTION DATA
                        number_b: ans.number_b, // SENDING QUESTION DATA
                    }),
                });
            } catch (error) {
                console.error('Failed to sync answer:', error);
                // Re-add to pending if failed? For now just log. 
                // Implementing retry logic might be too complex for now, assuming stable connection.
            }
        }
    }, [participant.id]);

    // Handle perpindahan session secara INSTAN (tanpa POST request blocking)
    const handleMinuteComplete = useCallback(() => {
        // BLOCK IF TOKEN EXPIRED (Most important check)
        if (isTokenExpiredRef.current) return;

        // Prevent multiple transitions
        if (isTransitioningRef.current) return;
        isTransitioningRef.current = true;

        // Sync any pending answers in background
        syncAnswersToBackend();

        // Check if test is complete
        if (currentMinute >= testConfig.totalMinutes) {
            if (!hasSubmittedCompletionRef.current) {
                hasSubmittedCompletionRef.current = true;
                setIsTestFinished(true);
                // Redirect to complete endpoint
                router.post(route('psikotest.kraepelin-test.mark-completed'), {
                    participant_id: participant.id,
                });
            }
            return;
        }

        // INSTANT LOCAL TRANSITION
        const nextMinute = currentMinute + 1;
        const newQuestions = generateNewQuestions(nextMinute);

        // Update state immediately - no waiting for backend
        setCurrentMinute(nextMinute);
        setQuestions(newQuestions);
        setCurrentQuestionIndex(0);
        setMinuteTimeLeft(SESSION_DURATION_SECONDS); // Reset to full 15 seconds
        setInputValue('');

        // Reset transition flag after a short delay
        setTimeout(() => {
            isTransitioningRef.current = false;
        }, 100);

    }, [currentMinute, testConfig.totalMinutes, participant.id, generateNewQuestions, syncAnswersToBackend]);

    const hasSubmittedCompletionRef = useRef(false);

    // Timer effect - countdown with DRIFT CORRECTION
    useEffect(() => {
        if (isTestFinished) return;

        const timer = setInterval(() => {
            // DRIFT CORRECTION: Sync with absolute time from server
            if (startedAt) {
                const now = Date.now();
                const start = new Date(startedAt).getTime();
                const elapsedSeconds = Math.floor((now - start) / 1000);

                // Calculate expected state based on absolute time
                const expectedMinute = Math.floor(elapsedSeconds / SESSION_DURATION_SECONDS) + 1;
                const secondsIntoSession = elapsedSeconds % SESSION_DURATION_SECONDS;
                const expectedTimeLeft = SESSION_DURATION_SECONDS - secondsIntoSession;

                // Case 1: Test Over by Time
                if (expectedMinute > testConfig.totalMinutes) {
                    clearInterval(timer);
                    if (!hasSubmittedCompletionRef.current) {
                        hasSubmittedCompletionRef.current = true;
                        setIsTestFinished(true);
                        syncAnswersToBackend(); // Final Sync
                        router.post(route('psikotest.kraepelin-test.mark-completed'), {
                            participant_id: participant.id,
                        });
                    }
                    return;
                }

                // Case 2: Drift Detected (Skipped Minutes or Tab Suspended)
                if (expectedMinute > currentMinute) {
                    syncAnswersToBackend();
                    setCurrentMinute(expectedMinute);
                    setQuestions(generateNewQuestions(expectedMinute));
                    setCurrentQuestionIndex(0);
                    setMinuteTimeLeft(expectedTimeLeft);
                    setInputValue('');
                    return;
                }
            }

            // Standard Decrement
            setMinuteTimeLeft(prev => {
                if (prev <= 1) {
                    setTimeout(() => handleMinuteComplete(), 0);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [currentMinute, isTestFinished, startedAt, testConfig.totalMinutes, participant.id, generateNewQuestions, syncAnswersToBackend, handleMinuteComplete]);

    // Handle submit jawaban (optimistic update)
    const handleAnswerSubmit = useCallback((answer: number) => {
        if (isTokenExpiredRef.current) return;

        const currentQ = questions[currentQuestionIndex];
        if (!currentQ) return;

        // Update state lokal
        const updatedQuestions = [...questions];
        updatedQuestions[currentQuestionIndex] = {
            ...currentQ,
            user_answer: answer
        };
        setQuestions(updatedQuestions);

        // Tambahkan ke pending queue
        pendingAnswersRef.current.push({
            minute_number: currentMinute,
            question_index: currentQ.index,
            answer: answer,
            number_a: currentQ.number_a, // ADDED
            number_b: currentQ.number_b, // ADDED
        });

        // Trigger sync jika queue cukup banyak atau logic lain? (optional, misal setiap 5 soal)
        // Saat ini kita sync hanya saat menit selesai atau drift jump. 
        // Mungkin aman untuk trigger sync setiap 5 soal? 
        // Trigger sync jika queue cukup banyak
        if (pendingAnswersRef.current.length >= 5) {
            syncAnswersToBackend();
        }

        // Pindah ke soal berikutnya
        setCurrentQuestionIndex(prev => prev + 1);
        setInputValue('');

    }, [isTestFinished, questions, currentQuestionIndex, currentMinute, syncAnswersToBackend]);

    // Format waktu untuk display
    const formatTime = (seconds: number) => {
        if (seconds < 60) {
            return `0:${seconds.toString().padStart(2, '0')}`;
        }
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const currentQ = Array.isArray(questions) ? questions[currentQuestionIndex] : null;
    const progress = (testConfig && testConfig.totalMinutes) ? (currentMinute / testConfig.totalMinutes) * 100 : 0;

    return (
        <>
            <Head title={`Tes Kraepelin - Session ${currentMinute}`} />

            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100 dark:bg-gray-900">
                {/* Main Card */}
                <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
                    {/* Title */}
                    <h1 className="text-xl font-bold text-center text-gray-800 dark:text-white mb-6">
                        Tes Kraepelin
                    </h1>

                    {/* Progress Bar Section */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-2">
                            {/* Session Counter */}
                            <span className="text-sm font-semibold text-[#E0A75E]">
                                Session {currentMinute.toString().padStart(2, '0')} / {testConfig.totalMinutes}
                            </span>
                            {/* Timer - merah dan berkedip jika <= 5 detik */}
                            <span className={`text-sm font-semibold ${minuteTimeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-[#E0A75E]'}`}>
                                Sisa Waktu: {formatTime(minuteTimeLeft)}
                            </span>
                        </div>
                        {/* Progress bar visual */}
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-[#E0A75E] h-2 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    {/* Question Card */}
                    {currentQ && (
                        <div className="mb-6">
                            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center">
                                <div className="flex items-center justify-center gap-3">
                                    {/* Angka pertama */}
                                    <span className="text-5xl font-bold text-gray-800 dark:text-gray-100">
                                        {currentQ.number_a}
                                    </span>
                                    <span className="text-3xl text-gray-500">+</span>
                                    {/* Angka kedua */}
                                    <span className="text-5xl font-bold text-gray-800 dark:text-gray-100">
                                        {currentQ.number_b}
                                    </span>
                                    <span className="text-3xl text-gray-500">=</span>
                                    {/* Input jawaban */}
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]"
                                        maxLength={1}
                                        value={inputValue}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/[^0-9]/g, '');
                                            setInputValue(val);
                                            if (val) {
                                                // Delay singkat agar user bisa lihat input mereka
                                                setTimeout(() => {
                                                    handleAnswerSubmit(parseInt(val));
                                                }, 150);
                                            }
                                        }}
                                        className="w-14 h-14 text-3xl text-center font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#E0A75E] focus:ring-2 focus:ring-[#E0A75E]/30 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder=""
                                        autoComplete="off"
                                        disabled={isTestFinished}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Note */}
                    <p className="text-xs text-gray-400 text-center mt-4">
                        *kamu tidak dapat kembali ke pertanyaan sebelumnya
                    </p>
                </div>
            </div>
        </>
    );
}
