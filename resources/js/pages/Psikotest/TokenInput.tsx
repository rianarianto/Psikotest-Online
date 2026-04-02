import React, { useState, useEffect } from 'react';
import { Head, usePage, useForm } from '@inertiajs/react';
import type { SharedData } from '@/types';
import AppLogoIcon from '@/components/app-logo-icon';

export default function TokenInput() {
    const { auth } = usePage<SharedData>().props;

    const { data, setData, post, processing, errors } = useForm({
        token: '',
    });

    // State untuk mengontrol visibilitas modal peringatan fokus
    const [showFocusWarningModal, setShowFocusWarningModal] = useState(false);
    // Counter untuk melacak berapa kali fokus hilang.
    // Menggunakan useState agar perubahan nilai ini dapat memicu re-render
    // dan memungkinkan kita menampilkan hitungan di UI jika diperlukan.
    const [focusLossCount, setFocusLossCount] = useState(0);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.token.trim()) {
            const input = document.querySelector('input[name="token"]');
            input?.classList.add('animate-shake');
            setTimeout(() => {
                input?.classList.remove('animate-shake');
            }, 500);

            return;
        }

        post(route('psikotest.verify-token'), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Psikotest Online">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>

            <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a] bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url('/images/background/bg1.png')` }}>
                {/* Header ini dikomentari karena tidak relevan untuk halaman tes */}
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
                    <main className="flex w-full max-w-[350px] lg:max-w-xl lg:flex-row">
                        <div className="flex-1 rounded-md bg-white p-12 text-[13px] leading-[20px] shadow-[0_4px_12px_rgba(0,0,0,0.1)] lg:p-16 dark:bg-[#1e1e1e] dark:text-[#EDEDEC] dark:shadow-[0_6px_16px_rgba(0,0,0,0.2)]">

                            {/* Logo */}
                            <div className="flex justify-center mb-6">
                                <AppLogoIcon className="w-36 fill-current text-black dark:text-white" />
                            </div>

                            {/* Judul */}
                            <h1 className="text-center mb-2 text-base font-semibold text-[#1b1b18] dark:text-white">
                                Masukkan Token Aktivasi
                            </h1>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6">
                                <input
                                    autoFocus
                                    type="text"
                                    name="token"
                                    value={data.token}
                                    onChange={(e) => setData('token', e.target.value)}
                                    placeholder="Masukkan token Anda"
                                    className={`w-full max-w-xs rounded-md border p-3 text-sm shadow-sm focus:ring-1 dark:bg-[#1c1c1a] dark:text-white text-center
                                        ${errors.token ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-120 focus:border-[#DBA552] focus:ring-[#DBA552] dark:border-[#3E3E3A]'}`}
                                />

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className={`w-full max-w-xs rounded-md px-5 py-2 text-sm font-medium text-white ${processing
                                        ? 'bg-[#BC8024] cursor-not-allowed'
                                        : 'bg-[#DBA552] hover:bg-[#BC8024]'
                                        } dark:bg-[#DBA552] dark:hover:bg-[#BC8024]`}
                                >
                                    {processing ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Memverifikasi...
                                        </span>
                                    ) : 'Mulai Tes'}
                                </button>
                            </form>
                        </div>
                    </main>
                </div>
                <div className="hidden h-14.5 lg:block"></div>
            </div>


        </>
    );
}
