import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, usePage, useForm } from '@inertiajs/react';
import type { SharedData } from '@/types';
import AppLogoIcon from '@/components/app-logo-icon';
import Swal from 'sweetalert2';

export default function BiodataForm() {
    const { auth } = usePage<SharedData>().props;
    // Ganti nama 'errors' dari usePage().props menjadi 'serverErrors'
    const { errors: serverErrors, old } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        age: '',
        position: '',
        institution: '',
    });

    const [showFocusWarningModal, setShowFocusWarningModal] = useState(false);
    const [focusLossCount, setFocusLossCount] = useState(0);

    useEffect(() => {
        const handleRightClick = (event: MouseEvent) => {
            event.preventDefault();
            Swal.fire({
                icon: 'warning',
                title: 'Akses Dibatasi',
                text: 'Klik kanan mouse dinonaktifkan di halaman ini.',
                position: 'top',
                timer: 2000,
                showConfirmButton: false,
                showCloseButton: true,
                toast: true,
                timerProgressBar: true,
            });
        };

        document.addEventListener('contextmenu', handleRightClick);

        return () => {
            document.removeEventListener('contextmenu', handleRightClick);
        };
    }, []);


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


    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            const message = "Anda yakin ingin meninggalkan halaman ini? Ini akan membatalkan sesi tes Anda.";
            event.returnValue = message;
            event.returnValue = message;
            return message;
        };

        const handleBlur = () => {
            setFocusLossCount(prevCount => prevCount + 1);
            console.log('Fokus hilang. Jumlah kehilangan fokus:', focusLossCount + 1);

            setShowFocusWarningModal(true);
        };

        const handleFocus = () => {
            console.log('Fokus kembali.');
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
        };
    }, [focusLossCount]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.name.trim() || !data.email.trim() || !data.age || !data.position.trim() || !data.institution.trim()) {
            Swal.fire({
                icon: 'error',
                title: 'Data Belum Lengkap',
                text: 'Semua kolom wajib diisi!',
                position: 'top',
                timer: 3000,
                showConfirmButton: false,
                showCloseButton: true,
                toast: true,
                timerProgressBar: true,
            });
            return;
        }

        post(route('psikotest.biodata.store'), {
            preserveScroll: true,
            onError: (formErrors) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Kesalahan Input',
                    text: 'Mohon periksa kembali data yang Anda masukkan.',
                    position: 'top-end',
                    toast: true,
                    timer: 5000,
                    showConfirmButton: false,
                    showCloseButton: true,
                    timerProgressBar: true,
                });
            }
        });
    };

    return (
        <>
            <Head title="Isi Biodata">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>

            <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a] bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url('/images/background/bg1.png')` }}>
                <div className="flex w-full items-center justify-center opacity-100 transition-opacity duration-750 lg:grow starting:opacity-0">
                    <main className="flex w-lg lg:w-5xl lg:flex-row rounded-md overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.1)] dark:shadow-[0_6px_16px_rgba(0,0,0,0.2)]">
                        <div className="hidden pr-10 lg:flex w-1/2 justify-center items-center bg-[#fcfcfc] dark:bg-[#1e1e1e]">
                            <img src="/images/asset/formillustration.png" alt="Ilustrasi Biodata" className="max-w-full h-auto object-contain" />
                        </div>

                        <div className="flex-1 lg:w-1/2 p-12 lg:p-16 bg-white dark:bg-[#1f1f1f] text-[13px] leading-[20px] shadow-[0_1px_1px_rgba(255,255,255,0.1)]">
                            <div className="flex justify-center mb-6">
                                <AppLogoIcon className="w-36 fill-current text-black dark:text-white" />
                            </div>

                            <h1 className="text-center mb-4 text-sm font-semibold text-[#1b1b18] dark:text-white">
                                Formulir Biodata Peserta
                            </h1>

                            <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3">
                                <div className="w-full max-w-xs">
                                    <label htmlFor="name" className="block text-md font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Lengkap</label>
                                    <input
                                        autoFocus
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Nama Lengkap Anda"
                                        required
                                        className={`w-full rounded-sm border p-2 text-xs shadow-sm focus:ring-1 dark:bg-[#1c1c1a] dark:text-white
                                            ${errors.name || serverErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-120 focus:border-[#DBA552] focus:ring-[#DBA552] dark:border-[#3E3E3A]'}`}
                                    />
                                    {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                                    {serverErrors.name && <p className="mt-1 text-xs text-red-600">{serverErrors.name}</p>}
                                </div>

                                <div className="w-full max-w-xs">
                                    <label htmlFor="email" className="block text-md font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="Email Aktif Anda"
                                        required
                                        className={`w-full rounded-sm border p-2 text-xs shadow-sm focus:ring-1 dark:bg-[#1c1c1a] dark:text-white
                                            ${errors.email || serverErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-120 focus:border-[#DBA552] focus:ring-[#DBA552] dark:border-[#3E3E3A]'}`}
                                    />
                                    {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                                    {serverErrors.email && <p className="mt-1 text-xs text-red-600">{serverErrors.email}</p>}
                                </div>

                                <div className="w-full max-w-xs">
                                    <label htmlFor="age" className="block text-md font-medium text-gray-700 dark:text-gray-300 mb-1">Usia</label>
                                    <input
                                        type="number"
                                        id="age"
                                        name="age"
                                        value={data.age}
                                        onChange={(e) => setData('age', e.target.value)}
                                        placeholder="Usia Anda (misal: 25)"
                                        required
                                        // Kondisi border akan merah jika ada error dari serverErrors ATAU errors dari useForm
                                        className={`w-full rounded-sm border p-2 text-xs shadow-sm focus:ring-1 dark:bg-[#1c1c1a] dark:text-white
                                        ${errors.age || serverErrors.age ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-120 focus:border-[#DBA552] focus:ring-[#DBA552] dark:border-[#3E3E3A]'}`}
                                    />
                                    {/* Tampilkan error dari serverErrors jika ada, jika tidak ada, baru cek error dari useForm */}
                                    {(serverErrors.age || errors.age) && (
                                        <p className="mt-1 text-xs text-red-600">{serverErrors.age || errors.age}</p>
                                    )}
                                </div>

                                <div className="w-full max-w-xs">
                                    <label htmlFor="position" className="block text-md font-medium text-gray-700 dark:text-gray-300 mb-1">Posisi atau Jabatan</label>
                                    <input
                                        type="text"
                                        id="position"
                                        name="position"
                                        value={data.position}
                                        onChange={(e) => setData('position', e.target.value)}
                                        placeholder="Contoh: Marketing Manager"
                                        required
                                        className={`w-full rounded-sm border p-2 text-xs shadow-sm focus:ring-1 dark:bg-[#1c1c1a] dark:text-white
                                            ${errors.position || serverErrors.position ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-120 focus:border-[#DBA552] focus:ring-[#DBA552] dark:border-[#3E3E3A]'}`}
                                    />
                                    {errors.position && <p className="mt-1 text-xs text-red-600">{errors.position}</p>}
                                    {serverErrors.position && <p className="mt-1 text-xs text-red-600">{serverErrors.position}</p>}
                                </div>

                                <div className="w-full max-w-xs">
                                    <label htmlFor="institution" className="block text-md font-medium text-gray-700 dark:text-gray-300 mb-1 ">Institusi/Perusahaan</label>
                                    <input
                                        type="text"
                                        id="institution"
                                        name="institution"
                                        value={data.institution}
                                        onChange={(e) => setData('institution', e.target.value)}
                                        placeholder="Contoh: PT. Yogura Tekindo"
                                        required
                                        className={`w-full rounded-sm border p-2 text-xs shadow-sm focus:ring-1 dark:bg-[#1c1c1a] dark:text-white
                                            ${errors.institution || serverErrors.institution ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-120 focus:border-[#DBA552] focus:ring-[#DBA552] dark:border-[#3E3E3A]'}`}
                                    />
                                    {errors.institution && <p className="mt-1 text-xs text-red-600">{errors.institution}</p>}
                                    {serverErrors.institution && <p className="mt-1 text-xs text-red-600">{serverErrors.institution}</p>}
                                </div>

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
                                            Menyimpan...
                                        </span>
                                    ) : 'Lanjut'}
                                </button>
                            </form>
                        </div>
                    </main>
                </div>
                <div className="hidden h-14.5 lg:block"></div>
            </div>

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