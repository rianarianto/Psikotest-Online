import React from 'react';
import { Head, router } from '@inertiajs/react';
import Swal from 'sweetalert2';

interface TestItem {
    id: number;
    code: string;
    name: string;
    description: string;
    duration_minutes: number;
    instruction_route: string;
    test_route: string;
    icon: string;
    status: 'not_started' | 'in_progress' | 'completed';
    started_at: string | null;
    completed_at: string | null;
}

interface Participant {
    id: number;
    name: string;
    email: string;
    age: number;
    position: string;
    institution: string;
}

interface TokenInfo {
    id: string;
    expires_at: string | null;
    remaining_seconds: number;
}

interface Props {
    participant: Participant;
    token: TokenInfo;
    tests: TestItem[];
    allCompleted: boolean;
    errors?: any;
}

export default function GeneralInstructions({ participant, token, tests, allCompleted, errors }: Props) {
    const [remainingTime, setRemainingTime] = React.useState(token.remaining_seconds);
    const [currentTime, setCurrentTime] = React.useState(new Date());

    // Update current time every minute
    React.useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Countdown timer for token expiration
    React.useEffect(() => {
        if (remainingTime <= 0) {
            // Token has expired - redirect to home
            router.visit(route('home'), {
                method: 'get',
            });
            return;
        }

        const timer = setInterval(() => {
            setRemainingTime(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    // Token expired - will trigger redirect on next render
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [remainingTime]);

    const formatCountdown = (seconds: number) => {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${days.toString().padStart(2, '0')}:${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const formatServerTime = (date: Date) => {
        return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) + ' WIB';
    };

    const handleStartTest = (test: TestItem) => {
        if (test.status === 'completed') return;
        // Logic to check if previous tests are completed could be added here if needed
        // but for now we follow the "Mulai Test" button available states.
        router.visit(route(test.instruction_route));
    };

    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const handleSubmitAll = () => {
        setIsSubmitting(true);
        router.post(route('psikotest.submit-all'), {}, {
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: 'Luar Biasa!',
                    text: 'Seluruh rangkaian tes telah Anda selesaikan dengan baik. Terima kasih atas partisipasi Anda.',
                    confirmButtonText: 'Selesai',
                    customClass: {
                        confirmButton: 'bg-[#DBA552] hover:bg-[#BC8024] text-white rounded-md px-6 py-2',
                    },
                    buttonsStyling: false,
                    allowOutsideClick: false,
                }).then(() => {
                    // Redirect to logout after user clicks OK
                    router.post(route('psikotest.logout'));
                });
            },
            onError: (err) => {
                setIsSubmitting(false);
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal Mengirim',
                    text: 'Terjadi kesalahan saat mengirim hasil assessment. Silakan coba lagi.',
                    confirmButtonText: 'OK',
                    customClass: {
                        confirmButton: 'bg-red-600 text-white rounded-md px-6 py-2',
                    },
                    buttonsStyling: false,
                });
            },
            onFinish: () => setIsSubmitting(false)
        });
    };

    return (
        <>
            <Head title="Psikotest Assessment" />

            <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-4 md:p-8 font-sans">
                <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-[800px] p-8 md:p-12">

                    <h1 className="text-3xl font-bold text-[#333333] mb-8">
                        Psikotest Assessment
                    </h1>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-[#FFF9F0] p-4 rounded-xl border-1 border-[#FFF1DE]">
                            <p className="text-xs text-[#333333]/60">Peserta</p>
                            <p className="text-md font-medium text-[#555555] truncate">{participant.name}</p>
                        </div>
                        <div className="bg-[#FFF9F0] p-4 rounded-xl border-1 border-[#FFF1DE]">
                            <p className="text-xs text-[#333333]/60">Posisi</p>
                            <p className="text-md font-medium text-[#555555] truncate">{participant.position}</p>
                        </div>
                        <div className="bg-[#FFF9F0] p-4 rounded-xl border-1 border-[#FFF1DE]">
                            <p className="text-xs text-[#333333]/60">Waktu Server</p>
                            <p className="text-md font-medium text-[#555555] truncate">{formatServerTime(currentTime)}</p>
                        </div>
                        <div className="bg-[#FFF9F0] p-4 rounded-xl border-1 border-[#FFF1DE]">
                            <p className="text-xs text-[#333333]/60">Hitung Mundur</p>
                            <p className="text-md font-medium text-[#555555] truncate font-mono">{formatCountdown(remainingTime)}</p>
                        </div>
                    </div>

                    {/* Instruction Box */}
                    <div className="bg-[#FFF9EA] border-l-4 border-[#EAB308] p-6 rounded-r-xl rounded-l-xs mb-10">
                        <ol className="list-decimal list-outside ml-5 space-y-2 text-[#555555] text-sm leading-relaxed">
                            <li>
                                Assessment harus diselesaikan sebelum pukul <span className="font-bold">{token.expires_at ? new Date(token.expires_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }) : '16.00'}</span> hari <span className="font-bold">{token.expires_at ? new Date(token.expires_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '9 Desember 2025'}</span>.
                            </li>
                            <li>
                                Assessment hanya dapat dilakukan berurutan, jadi kamu hanya bisa mengakses test tertentu jika test sebelumnya sudah selesai.
                            </li>
                            <li>
                                Kamu dapat melakukan break dan kembali lagi untuk melakukan assessment selama masih dalam rentang waktu yang diberikan.
                            </li>
                        </ol>
                    </div>

                    {/* Test List */}
                    <div className="space-y-6">
                        {tests.map((test, index) => {
                            const isCompleted = test.status === 'completed';
                            const isPreviousCompleted = index === 0 || tests[index - 1].status === 'completed';
                            const canStart = isPreviousCompleted && !isCompleted;

                            return (
                                <div key={test.id} className="border border-[#E5E7EB] rounded-2xl p-6">
                                    <div className="flex flex-col gap-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-[#333333] mb-3">{test.name}</h3>
                                            <div className="flex gap-2 mb-4">
                                                <span className="bg-[#FFF3E0] text-[#D49646] px-3 py-1 rounded-md text-xs font-semibold">
                                                    {test.duration_minutes} Menit
                                                </span>
                                                <span className={`${isCompleted ? 'bg-green-100 text-green-700' : 'bg-[#F3F4F6] text-[#9CA3AF]'} px-3 py-1 rounded-md text-xs font-semibold`}>
                                                    {isCompleted ? 'Selesai' : 'Belum Dimulai'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-[#6B7280] leading-relaxed">
                                                {test.description}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleStartTest(test)}
                                            disabled={!canStart}
                                            className={`w-fit px-6 py-2 rounded-lg font-bold text-sm transition-all ${canStart
                                                ? 'bg-[#E0A75E] hover:bg-[#D49646] text-white shadow-md'
                                                : 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
                                                }`}
                                        >
                                            {isCompleted ? 'Selesai' : 'Mulai Test'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Errors Display */}
                    {errors && Object.keys(errors).length > 0 && (
                        <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-xl">
                            <ul className="list-disc list-inside text-sm text-red-600">
                                {Object.values(errors).map((err: any, i) => (
                                    <li key={i}>{err}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Submit All Button (Hidden in image, but likely needed) */}
                    {allCompleted && (
                        <div className="mt-12 text-center">
                            <button
                                onClick={handleSubmitAll}
                                disabled={isSubmitting}
                                className={`w-full bg-[#D49646] hover:bg-[#C8892B] text-white font-bold py-4 rounded-xl text-lg shadow-lg transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isSubmitting ? 'Sedang Mengirim...' : 'Submit Hasil Assessment'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
