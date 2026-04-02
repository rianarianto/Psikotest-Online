import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';

interface Participant {
    id: number;
    name: string;
}

interface Props {
    participant: Participant;
}

export default function KraepelinInstructions({ participant }: Props) {
    const handleStartTest = () => {
        router.visit(route('psikotest.kraepelin-test'));
    };

    return (
        <>
            <Head title="Instruksi Tes Kraepelin" />

            <div
                className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a] bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url('/images/background/bg1.png')` }}
            >
                <div className="flex w-full items-center justify-center opacity-100 transition-opacity duration-750 lg:grow">
                    <main className="flex w-full max-w-2xl lg:flex-row rounded-xl overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.1)] dark:shadow-[0_6px_16px_rgba(0,0,0,0.2)]">
                        <div className="flex-1 bg-white p-6 pb-12 text-[13px] leading-[20px] lg:p-12 dark:bg-[#1e1e1e] dark:text-[#EDEDEC]">

                            {/* Logo */}
                            <div className="flex justify-center mb-6">
                                <AppLogoIcon className="w-36 fill-current text-black dark:text-white" />
                            </div>

                            {/* Greeting */}
                            {participant && (
                                <p className="text-center mb-4 text-base font-medium text-[#1b1b18] dark:text-white">
                                    Halo, <span className="font-semibold text-[#DBA552]">{participant.name}</span>!
                                </p>
                            )}

                            {/* Title */}
                            <h2 className="text-xl font-semibold mb-6 text-center text-[#1b1b18] dark:text-white">
                                📊 Instruksi Tes Kraepelin
                            </h2>

                            {/* Instructions */}
                            <div className="mb-8">
                                <ul className="space-y-2 text-gray-700 dark:text-gray-300 bg-[#fafafa] p-6 rounded-xl border border-black/4">
                                    <li className="flex items-center gap-3">
                                        <span className="text-[#DBA552] font-bold text-sm">1</span>
                                        <span className='text-sm'>
                                            Tes ini berlangsung selama <strong>20 menit</strong> dengan setiap menit berisi soal penjumlahan angka.
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-[#DBA552] font-bold text-sm">2</span>
                                        <span className='text-sm'>
                                            Anda akan melihat dua angka yang harus dijumlahkan. <strong>Tuliskan hanya digit satuan</strong> dari hasil penjumlahan.
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-[#DBA552] font-bold text-sm">3</span>
                                        <span className='text-sm'>
                                            Contoh: <strong>7 + 8 = 15</strong>, maka jawaban yang benar adalah <strong>5</strong>.
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-[#DBA552] font-bold text-sm">4</span>
                                        <span className='text-sm'>
                                            Setiap <strong>60 detik</strong>, soal akan berganti ke set berikutnya. Kerjakan secepat dan seakurat mungkin.
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-[#DBA552] font-bold text-sm">5</span>
                                        <span className='text-sm'>
                                            Gunakan <strong>tombol angka</strong> atau keyboard untuk menjawab dengan cepat.
                                        </span>
                                    </li>
                                </ul>
                            </div>

                            {/* Example */}
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-8">
                                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Contoh Soal:</p>
                                <div className="flex items-center justify-center gap-4">
                                    <span className="text-4xl font-bold text-gray-800 dark:text-white">7</span>
                                    <span className="text-2xl">+</span>
                                    <span className="text-4xl font-bold text-gray-800 dark:text-white">8</span>
                                    <span className="text-2xl text-gray-400">=</span>
                                    <span className="text-4xl font-bold text-green-600">5</span>
                                </div>
                                <p className="text-xs text-center text-gray-500 mt-2">
                                    (7 + 8 = 15, digit satuan = 5)
                                </p>
                            </div>

                            {/* Warning */}
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-8">
                                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                    ⚠️ <strong>Perhatian:</strong> Setelah tes dimulai, timer tidak dapat dihentikan. Pastikan Anda berada di tempat yang tenang dan siap untuk mengerjakan selama 20 menit penuh.
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleStartTest}
                                    className="w-full py-3 bg-[#DBA552] hover:bg-[#BC8024] text-white font-semibold rounded-lg transition-colors text-base"
                                >
                                    Mulai Tes Kraepelin
                                </button>
                                <Link
                                    href={route('psikotest.general-instructions')}
                                    className="w-full py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors text-center text-sm"
                                >
                                    Kembali ke Daftar Tes
                                </Link>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
