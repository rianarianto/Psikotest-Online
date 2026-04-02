import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import Swal from 'sweetalert2';
import type { SharedData } from '@/types';

interface Question {
    id: number;
    statement_a: string;
    statement_b: string;
}

interface PapiKostickTestProps extends SharedData {
    questions: Question[];
    existingAnswers: { [questionId: number]: 'A' | 'B' };
    participantId: number;
    testType: 'papi' | 'kraepelin' | 'alltest';
    startingQuestionIndex: number;
    timeLimitInMinutes: number;
    papiTestStartedAt: string | null;
    tokenExpiresAt: string | null;
    tokenRemainingSeconds: number;
}

export default function Papikostick() {

    const [showFocusWarningModal, setShowFocusWarningModal] = useState(false);
    const [focusLossCount, setFocusLossCount] = useState(0);

    // useEffect to disable right-click, prevent text selection, and block copy/cut/paste
    useEffect(() => {
        const handleRightClick = (event: MouseEvent) => {
            event.preventDefault(); // Prevent default right-click behavior
        };

        const handleCopyCutPaste = (event: ClipboardEvent) => {
            event.preventDefault(); // Prevent default copy/cut/paste actions
        };

        // This function prevents text selection
        const handleSelectStart = (event: Event) => {
            event.preventDefault(); // Prevent text selection initiation
        };



        // Add event listeners
        document.addEventListener('contextmenu', handleRightClick);
        document.addEventListener('copy', handleCopyCutPaste);
        document.addEventListener('cut', handleCopyCutPaste);
        document.addEventListener('paste', handleCopyCutPaste);
        document.addEventListener('selectstart', handleSelectStart); // Crucial for selection prevention


    }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

    // useEffect to prevent user from leaving page and detect focus loss
    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            const message = "Anda yakin ingin meninggalkan halaman ini? Ini akan membatalkan sesi tes Anda.";
            event.returnValue = message; // Standard for Chrome, Firefox
            return message; // For wider compatibility
        };

        const handleBlur = () => {
            setFocusLossCount(prevCount => prevCount + 1);
            console.log('Fokus hilang. Jumlah kehilangan fokus:', focusLossCount + 1);

            setShowFocusWarningModal(true);
        };

        const handleFocus = () => {
            console.log('Fokus kembali.');
            // We're not automatically hiding the modal here; it's hidden when the button inside it is clicked.
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
        };
    }, [focusLossCount]); // Add focusLossCount to dependency array so useEffect sees the latest value

    const { questions = [], existingAnswers = {}, participantId, testType, startingQuestionIndex = 0, timeLimitInMinutes = 90, papiTestStartedAt = null, tokenExpiresAt = null, tokenRemainingSeconds = 0 } = usePage<PapiKostickTestProps>().props;

    // State untuk monitoring token expiration
    const [tokenTimeLeft, setTokenTimeLeft] = useState(tokenRemainingSeconds);
    const isTokenExpiredRef = useRef(false);



    // Effect untuk token expiration countdown dan auto-redirect
    useEffect(() => {
        // Jika sudah expired dari awal (misal refresh saat sudah lewat)
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
        // Stop Everything
        setIsTestFinished(true);

        // Show Alert and Force Exit
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
            showCloseButton: true,
        }).then(() => {
            // Force hard redirect to home/login and clear history
            window.location.href = '/';
        });
    };

    // Key for sessionStorage based on participantId
    const questionIndexStorageKey = `papikostick_question_index_${participantId}`;

    // Initialize timeLeft: Calculated from the persistent start time from the backend
    const initialTimeLeft = useCallback(() => {
        const totalTimeSeconds = timeLimitInMinutes * 60;
        if (papiTestStartedAt) {
            const startTime = new Date(papiTestStartedAt).getTime();
            const currentTime = new Date().getTime();
            const elapsedTimeSeconds = Math.floor((currentTime - startTime) / 1000);
            const remaining = totalTimeSeconds - elapsedTimeSeconds;
            return Math.max(0, remaining); // Ensure no negative time
        }
        return totalTimeSeconds; // Default if start time isn't available
    }, [timeLimitInMinutes, papiTestStartedAt]);

    // Initialize currentQuestionIndex: get from sessionStorage if available, otherwise use startingQuestionIndex from props
    const initialQuestionIndex = () => {
        if (typeof window !== 'undefined') {
            const storedIndex = sessionStorage.getItem(questionIndexStorageKey);
            let resumeIndex = startingQuestionIndex || 0;

            if (storedIndex) {
                const parsedIndex = parseInt(storedIndex, 10);
                if (!isNaN(parsedIndex) && parsedIndex >= 0) {
                    resumeIndex = Math.max(parsedIndex, startingQuestionIndex || 0);
                }
            }
            const qCount = questions?.length || 0;
            return Math.min(resumeIndex, qCount > 0 ? qCount - 1 : 0);
        }
        return startingQuestionIndex || 0;
    };

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(initialQuestionIndex);
    const [timeLeft, setTimeLeft] = useState(initialTimeLeft);
    const [isTestFinished, setIsTestFinished] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // showCompletionScreen now only for when a user resumes a test that was already completed
    const [showCompletionScreen, setShowCompletionScreen] = useState(
        startingQuestionIndex > 0 && Array.isArray(questions) && startingQuestionIndex >= questions.length
    );

    const { data, setData, processing } = useForm<{
        answers: { question_id: number; answer: 'A' | 'B' }[];
    }>({
        answers: Object.entries(existingAnswers).map(([question_id, answer]) => ({
            question_id: parseInt(question_id),
            answer: answer,
        })),
    });

    const totalQuestions = Array.isArray(questions) ? questions.length : 0;
    const currentQuestion = Array.isArray(questions) && questions[currentQuestionIndex] ? questions[currentQuestionIndex] : null;

    // Using useCallback for handleSubmitFinal to make it stable and avoid useEffect loops
    const handleSubmitFinal = useCallback(async (isTimeOut: boolean = false) => {
        if (processing || isTestFinished) {
            return;
        }

        setIsTestFinished(true); // Immediately set finished to prevent further interaction

        try {
            await router.post(
                route('psikotest.papi-test.mark-completed'),
                {
                    participant_id: participantId,
                    is_timeout: isTimeOut, // Send is_timeout flag
                },
                {
                    preserveScroll: true,
                    onSuccess: (page) => {
                        // Clear sessionStorage after test is complete
                        if (typeof window !== 'undefined') {
                            sessionStorage.removeItem(questionIndexStorageKey);
                        }

                        Swal.fire({
                            icon: 'success',
                            title: 'Test Completed!',
                            text: isTimeOut ? 'Time is up. Your answers have been saved.' : 'Thank you, the test has been completed!',
                            confirmButtonText: 'Submit',
                            customClass: {
                                confirmButton: 'bg-[#DBA552] hover:bg-[#BC8024] text-white rounded-md px-4 py-2',
                            },
                            buttonsStyling: false,
                            showCloseButton: true,
                        }).then(() => {
                            router.visit(route('psikotest.general-instructions'));
                        });
                    },
                    onError: (formErrors) => {
                        setIsTestFinished(false); // Reset finished status so user can try again if there's an error
                    }
                }
            );
        } catch (error) {
            setIsTestFinished(false); // Reset finished status
            console.error("Final submission error:", error);
        }
    }, [processing, isTestFinished, participantId, questionIndexStorageKey]);

    // Effect for timer - Now counts from the persistent start time
    // Effect for timer - Now specifically designed to be robust against main thread blocking (lag)
    useEffect(() => {
        // Stop the timer if test is finished, no questions, or already on completion screen
        if (isTestFinished || totalQuestions === 0 || (showCompletionScreen && startingQuestionIndex >= questions.length)) return;

        // Use a reference timestamp to calculate elapsed time accurately
        // This prevents "drift" or "lag" if the interval callback is delayed by heavy processing
        const localStartTime = Date.now();
        const initialRemainingAtStart = timeLeft;

        const timer = setInterval(() => {
            // Calculate how much time has passed since this effect started
            const now = Date.now();
            const elapsed = Math.floor((now - localStartTime) / 1000);

            // Calculate true remaining time
            const newRemaining = Math.max(0, initialRemainingAtStart - elapsed);

            setTimeLeft(newRemaining);

            if (newRemaining <= 0) {
                clearInterval(timer);
                // Ensure we don't submit if token is already expired
                if (!isTokenExpiredRef.current) {
                    handleSubmitFinal(true); // Automatically submit when test time runs out
                }
                if (typeof window !== 'undefined') {
                    sessionStorage.removeItem(questionIndexStorageKey);
                }
            }
        }, 1000);

        // Cleanup function
        return () => clearInterval(timer);
    }, [isTestFinished, totalQuestions, showCompletionScreen, handleSubmitFinal, questionIndexStorageKey, startingQuestionIndex, questions.length]);

    // Effect to re-initialize timeLeft when the page loads or papiTestStartedAt changes
    // Use this as the main trigger for initial time
    useEffect(() => {
        setTimeLeft(initialTimeLeft());
    }, [initialTimeLeft]);


    // Effect to save currentQuestionIndex to sessionStorage
    useEffect(() => {
        // Save index only if test isn't finished and not on the completion screen (for tests completed from the start)
        if (typeof window !== 'undefined' && !isTestFinished && !showCompletionScreen && Array.isArray(questions) && questions.length > 0) {
            sessionStorage.setItem(questionIndexStorageKey, currentQuestionIndex.toString());
        }
    }, [currentQuestionIndex, isTestFinished, showCompletionScreen, questionIndexStorageKey, questions.length]);

    // IMPORTANT FIX: Stronger handling of browser back button
    useEffect(() => {
        const handlePopState = (event: PopStateEvent) => {
            if (typeof window !== 'undefined') {
                // Always force the current URL back to the top of the browser history
                // This effectively makes the "back" button do nothing but trigger a warning.
                // Add history.go(1) to force forward to the same page if the user presses the back button
                window.history.pushState(null, '', window.location.href);
                window.history.go(1); // This will force the browser to "go forward" back to the current page

                Swal.fire({
                    icon: 'warning',
                    title: 'Perhatian!',
                    text: 'Anda tidak diizinkan kembali ke halaman sebelumnya selama tes berlangsung.',
                    allowOutsideClick: false, // Cannot click outside to close
                    allowEscapeKey: false,   // Cannot press ESC to close
                    showConfirmButton: true,
                    confirmButtonText: 'Oke',
                    customClass: {
                        confirmButton: 'bg-[#DBA552] hover:bg-[#BC8024] text-white rounded-md px-4 py-2',
                    },
                    buttonsStyling: false,
                    showCloseButton: true,
                });
            }
        };

        if (typeof window !== 'undefined') {
            // Push a dummy state when the component mounts to 'start' the trap
            window.history.pushState(null, '', window.location.href);
            window.addEventListener('popstate', handlePopState);
        }

        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('popstate', handlePopState);
            }
        };
    }, []);


    // Format time (minutes:seconds)
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // Function to save ONE answer to the backend
    const saveAnswer = async (questionId: number, answer: 'A' | 'B') => {
        if (isSaving) return;

        setIsSaving(true);
        try {
            await router.post(
                route('psikotest.papi-test.save-single-answer'),
                {
                    question_id: questionId,
                    answer: answer,
                    participant_id: participantId,
                },
                {
                    preserveScroll: true,
                    preserveState: true,
                    onSuccess: () => { /* console.log('Answer saved'); */ },
                    onError: (err) => {
                        console.error('Failed to save answer:', err);
                    },
                    onFinish: () => {
                        setIsSaving(false);
                    }
                }
            );
        } catch (error) {
            setIsSaving(false);
            console.error("Error during single answer save:", error);
        }
    };

    // Handle user answer selection
    const handleAnswerChange = (questionId: number, answer: 'A' | 'B') => {
        // STRICT CHECK: If token expired, do NOTHING.
        if (isTokenExpiredRef.current) return;

        if (processing || isTestFinished || showCompletionScreen) return;

        setData(prevData => {
            const updatedAnswers = [...prevData.answers];
            const existingAnswerIndex = updatedAnswers.findIndex(
                ans => ans.question_id === questionId
            );

            if (existingAnswerIndex !== -1) {
                updatedAnswers[existingAnswerIndex].answer = answer;
            } else {
                updatedAnswers.push({ question_id: questionId, answer: answer });
            }
            return { ...prevData, answers: updatedAnswers };
        });

        // Call saveAnswer function to save the answer immediately
        saveAnswer(questionId, answer);

        // Move to the next question or AUTOMATICALLY SUBMIT if it's the last question
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(prevIndex => prevIndex + 1);
        } else {
            // If it's the last question, automatically submit the test.
            // Call handleSubmitFinal with a slight delay to ensure `data` state is updated
            setTimeout(() => {
                handleSubmitFinal(false); // Submit as manual completion (not timeout)
            }, 100); // Slight delay
        }
    };

    // Function to get the selected answer for the current question
    const getSelectedAnswer = (questionId: number) => {
        const foundAnswer = data.answers.find(ans => ans.question_id === questionId);
        return foundAnswer ? foundAnswer.answer : null;
    };

    // Display if no questions are available
    if (!questions || questions.length === 0) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#FDFDFC] dark:bg-[#0a0a0a]">
                <div className="text-center text-gray-700 dark:text-gray-300">
                    <p>No test questions available yet. Please contact the administrator.</p>
                </div>
            </div>
        );
    }

    const statementA = currentQuestion ? currentQuestion.statement_a : 'Memuat Pernyataan A...';
    const statementB = currentQuestion ? currentQuestion.statement_b : 'Memuat Pernyataan B...';

    const progressPercentage = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

    return (
        <>
            <Head title={`PapiKostick Test - Pertanyaan ${currentQuestionIndex + 1}`} />

            <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a] bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url('/images/background/bg1.png')` }}>
                <div className="flex w-full items-center justify-center opacity-100 transition-opacity duration-750 lg:grow starting:opacity-0">
                    <main className="flex w-full max-w-[350px] lg:max-w-2xl lg:flex-row">
                        <div className="flex-1 rounded-xl bg-white p-6 pb-12 text-[13px] leading-[20px] shadow-[0_4px_12px_rgba(0,0,0,0.1)] lg:p-20 dark:bg-[#1e1e1e] dark:text-[#EDEDEC] dark:shadow-[0_6px_16px_rgba(0,0,0,0.2)]">

                            {/* Logo */}
                            <div className="flex justify-center mb-6">
                                <AppLogoIcon className="w-36 fill-current text-black dark:text-white" />
                            </div>

                            {/* Condition to display "Test Completed" screen when resuming an already finished test */}
                            {showCompletionScreen ? (
                                <div className="flex flex-col items-center justify-center h-full text-center py-10">
                                    <h1 className="text-2xl font-semibold text-[#1b1b18] dark:text-white mb-4">Tes Sudah Selesai!</h1>
                                    <p className="text-base text-gray-700 dark:text-gray-300 mb-8">
                                        Anda telah menyelesaikan Tes Kepribadian ini. Silakan lanjutkan.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => handleSubmitFinal(false)} // Call handleSubmitFinal for redirect
                                        disabled={processing || isTestFinished}
                                        className={`w-full max-w-xs rounded-md px-5 py-2 text-base font-medium text-white
                                            ${processing || isTestFinished
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-[#DBA552] hover:bg-[#BC8024]'
                                            } transition-colors duration-200`}
                                    >
                                        {processing ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Memuat...
                                            </span>
                                        ) : 'Submit'}
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {/* Test Header: Progress & Saving Status */}
                                    <div className="mb-6 text-center">
                                        <h1 className="text-lg font-semibold text-[#1b1b18] dark:text-white mb-4">Tes Kepribadian</h1>
                                        <div className="flex flex-row items-end justify-between ">
                                            {/* Time remaining display */}
                                            <p className="text-sm font-bold text-[#DBA552] mb-2">
                                                Waktu Tersisa: {formatTime(timeLeft)}
                                            </p>
                                            {/* Question X of Y text */}
                                            <p className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-2">
                                                Pertanyaan {currentQuestionIndex + 1} dari {totalQuestions}
                                            </p>
                                        </div>
                                        {/* Progress Bar */}
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-6">
                                            <div
                                                className="bg-[#DBA552] h-2.5 rounded-full transition-all duration-500 ease-out"
                                                style={{ width: `${progressPercentage}%` }}
                                            ></div>
                                        </div>

                                        {isSaving && (
                                            <p className="text-sm text-[#DBA552] mt-1">
                                                Menyimpan jawaban...
                                            </p>
                                        )}
                                    </div>

                                    {/* Question Area */}
                                    <div className="flex flex-col items-center gap-2">
                                        <p className="text-sm text-center text-[#1b1b18] dark:text-white font-medium mb-4">
                                            Pilih pernyataan yang paling menggambarkan diri Anda:
                                        </p>

                                        {/* PapiKostick Questions (now as direct buttons) */}
                                        {currentQuestion && (
                                            <div className="flex flex-col gap-3 w-full">
                                                <button
                                                    type="button"
                                                    onClick={() => handleAnswerChange(currentQuestion.id, 'A')}
                                                    disabled={processing || isTestFinished || isSaving}
                                                    className={`w-full rounded-md px-5 py-4 text-base font-medium transition-colors duration-200 text-left
                                                        ${getSelectedAnswer(currentQuestion.id) === 'A'
                                                            ? 'bg-[#BC8024] text-white shadow-md'
                                                            : 'bg-gray-100 text-[#1b1b18] hover:bg-gray-200 dark:bg-[#2a2a2a] dark:text-white dark:hover:bg-[#3a3a3a]'
                                                        }
                                                        ${processing || isTestFinished || isSaving ? 'cursor-not-allowed opacity-70' : ''}`}
                                                >
                                                    <span className="font-semibold text-gray-800 dark:text-gray-200 mr-2">A.</span>
                                                    {statementA}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleAnswerChange(currentQuestion.id, 'B')}
                                                    disabled={processing || isTestFinished || isSaving}
                                                    className={`w-full rounded-md px-5 py-4 text-base font-medium transition-colors duration-200 text-left
                                                        ${getSelectedAnswer(currentQuestion.id) === 'B'
                                                            ? 'bg-[#BC8024] text-white shadow-md'
                                                            : 'bg-gray-100 text-[#1b1b18] hover:bg-gray-200 dark:bg-[#2a2a2a] dark:text-white dark:hover:bg-[#3a3a3a]'
                                                        }
                                                        ${processing || isTestFinished || isSaving ? 'cursor-not-allowed opacity-70' : ''}`}
                                                >
                                                    <span className="font-semibold text-gray-800 dark:text-gray-200 mr-2">B.</span>
                                                    {statementB}
                                                </button>
                                            </div>
                                        )}

                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                                            * Anda tidak dapat kembali ke pertanyaan sebelumnya setelah memilih jawaban.
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </main>
                </div>
                <div className="hidden h-14.5 lg:block"></div>
            </div>

            {/* Focus Warning Modal */}
            {showFocusWarningModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-[#1e1e1e] rounded-lg shadow-xl p-10 max-w-md w-full text-center">
                        <h2 className="text-3xl font-bold text-red-600 mb-4">PERINGATAN!</h2>
                        <p className="text-gray-800 dark:text-gray-200 mb-6 text-body">
                            Anda telah berpindah dari halaman tes. <br />Mohon tetap fokus pada tes.
                        </p>
                        <div className="p-5 bg-gray-400/25 rounded-xl">
                            <p className="text-sm text-gray-800 dark:text-gray-400">
                                Berpindah tab atau aplikasi lain akan dianggap sebagai upaya kecurangan dan mohon diingat bahwa proses test berada dibawah pengawasan kami.
                            </p>
                        </div>
                        {/* Tombol ini sekarang terlihat dan harus diklik untuk menutup modal */}
                        <button
                            onClick={() => setShowFocusWarningModal(false)}
                            className="mt-6 px-6 py-2 bg-[#DBA552] text-white text-sm rounded-md hover:bg-[#BC8024] transition-colors duration-200"
                        >
                            Baik, Saya Mengerti
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}