import React, { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';
import AppLogoIcon from '@/components/app-logo-icon';
import Swal from 'sweetalert2';

// Definisi props yang akan diterima dari InstructionController
interface PapiInstructionsProps {
    participant: {
        id: number;
        name: string;
    };
}

export default function PapiInstructions({ participant }: PapiInstructionsProps) {

    // useEffect untuk menonaktifkan klik kanan
    useEffect(() => {
        const handleRightClick = (event: MouseEvent) => {
            event.preventDefault(); // Mencegah perilaku default klik kanan
            // Menampilkan notifikasi info saat klik kanan dinonaktifkan
            Swal.fire({
                icon: 'warning',
                title: 'Akses Dibatasi',
                text: 'Klik kanan mouse dinonaktifkan di halaman ini.',
                position: "top",
                timer: 2000,
                showConfirmButton: false,
                showCloseButton: true,
                toast: true,
                timerProgressBar: true,
            });
        };

        // Menambahkan event listener ke seluruh dokumen
        document.addEventListener('contextmenu', handleRightClick);

        // Fungsi cleanup: menghapus event listener saat komponen di-unmount
        return () => {
            document.removeEventListener('contextmenu', handleRightClick);
        };
    }, []); // Array dependensi kosong berarti efek ini hanya berjalan sekali saat mount dan cleanup saat unmount

    const { auth } = usePage<SharedData>().props;

    const instructionsContent = (
        <>
            <h2 className="text-xl font-semibold mb-6 text-center text-[#1b1b18] dark:text-white">Petunjuk Pengisian Tes</h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p>Tes ini terdiri dari <span className="font-bold">90 pasangan pernyataan</span>. Harap perhatikan petunjuk berikut:</p>
                <ul className="list-decimal space-y-1 pl-4">
                    <li>Pilih <span className="font-bold">satu pernyataan (a atau b)</span> yang <span className="font-bold">paling menggambarkan diri Anda</span> saat ini.</li>
                    <li><span className="font-bold text-green-600">Tidak ada jawaban yang salah</span>; jawablah dengan jujur.</li>
                    <li>Jika kedua pernyataan tidak/keduanya mencerminkan diri Anda, <span className="font-bold">tetap pilih yang paling mendekati</span>.</li>
                    <li>Anda <span className="font-bold text-red-600">tidak dapat kembali</span> ke pertanyaan sebelumnya.</li>
                    <li>Pastikan Anda berada di tempat yang tenang.</li>
                    <li><span className="font-bold text-red-500">PERHATIAN: Seluruh pernyataan harus dijawab.</span></li>
                </ul>
                <div className="mt-6 p-4 bg-gray-100 dark:bg-[#2a2a2a] rounded-lg shadow-inner">
                    <p className="font-bold text-[#1b1b18] dark:text-white mb-2">Contoh:</p>
                    <p className="ml-4">
                        a. Saya Seorang Pekerja Giat<br />
                        b. Saya Bukan seorang pemurung
                    </p>
                    <p className="mt-2 ml-4 text-sm text-gray-600 dark:text-gray-400">
                        Pilih <span className="font-bold text-[#DBA552]">A</span> jika "Saya seorang pekerja giat" lebih mencerminkan diri Anda.
                    </p>
                </div>
            </div>
            <div className="mt-8 text-center text-gray-700 dark:text-gray-300">
                <p className="font-bold text-base">Jika Anda sudah siap, klik tombol "Mulai Tes" di bawah.</p>
            </div>
        </>
    );

    const startTestRoute = route('psikotest.papi-test', { participant_id: participant.id }); // Ini akan mengarah ke tes PapiKostick



    return (
        <>
            <Head title="Instruksi Tes PapiKostick" />

            <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a] bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url('/images/background/bg1.png')` }}>
                {/* <header className="mb-6 w-full max-w-[335px] text-sm not-has-[nav]:hidden lg:max-w-4xl">
                    <nav className="flex items-center justify-end gap-4">
                        {auth.user && (
                            <Link
                                href={route('dashboard')}
                                className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                            >
                                Dashboard
                            </Link>
                        )}
                    </nav>
                </header> */}

                <div className="flex w-full items-center justify-center opacity-100 transition-opacity duration-750 lg:grow starting:opacity-0">
                    <main className="flex w-full max-w-2xl lg:flex-row rounded-xl overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.1)] dark:shadow-[0_6px_16px_rgba(0,0,0,0.2)]">
                        <div className="flex-1 bg-white p-6 pb-12 text-[13px] leading-[20px] lg:p-20 dark:bg-[#1e1e1e] dark:text-[#EDEDEC]">

                            <div className="flex justify-center mb-6">
                                <AppLogoIcon className="w-36 fill-current text-black dark:text-white" />
                            </div>

                            <div className="mb-8">
                                {instructionsContent}
                            </div>

                            <div className="flex justify-center gap-4">
                                <Link
                                    href={route('psikotest.general-instructions')}
                                    className="inline-flex items-center justify-center rounded-md px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors duration-200"
                                >
                                    Kembali
                                </Link>
                                <Link
                                    href={startTestRoute}
                                    className="inline-flex items-center justify-center rounded-md px-6 py-2 text-sm font-medium text-white bg-[#DBA552] hover:bg-[#BC8024] dark:bg-[#DBA552] dark:hover:bg-[#BC8024] transition-colors duration-200"
                                >
                                    Mulai Tes
                                </Link>
                            </div>
                        </div>
                    </main>
                </div>
                <div className="hidden h-14.5 lg:block"></div>
            </div>
        </>
    );
}
