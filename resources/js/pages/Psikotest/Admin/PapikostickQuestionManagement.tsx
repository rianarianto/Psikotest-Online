import React, { useState, useEffect } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import Swal from 'sweetalert2';


// Interface untuk struktur data soal PapiKostick
interface PapiKostickQuestion {
    id: number;
    statement_a: string; // Menggunakan statement_a
    choice_a_trait: string | null; // Kode sifat PapiKostick
    statement_b: string; // Menggunakan statement_b
    choice_b_trait: string | null; // Kode sifat PapiKostick
    is_completed: boolean; // Indikator apakah soal sudah lengkap terisi
}

// Interface untuk props yang diterima dari Inertia
interface PapiKostickSettingsProps {
    auth: any; // Sesuaikan dengan tipe auth yang sebenarnya jika ada
    questions: PapiKostickQuestion[];
}

// Contoh data sifat PapiKostick (ini harus sesuai dengan data backend Anda)
const PAPI_KOSTICK_TRAITS = [
    { code: 'N', name: 'Menyelesaikan Tugas Pribadi' },
    { code: 'G', name: 'Peran Sebagai Pekerja Keras' },
    { code: 'A', name: 'Hasrat Untuk Berprestasi' },
    { code: 'P', name: 'Mengendalikan / Mengarahkan Orang Lain' },
    { code: 'X', name: 'Mendapatkan Perhatian' },
    { code: 'L', name: 'Peranan Sebagai Pemimpin' },
    { code: 'I', name: 'Mudah Membuat Keputusan' },
    { code: 'S', name: 'Pergaulan Luas' },
    { code: 'V', name: 'Stamina' },
    { code: 'K', name: 'Agresifitas' },
    { code: 'B', name: 'Kebutuhan Terhadap Kelompok' },
    { code: 'Z', name: 'Hasrat Untuk Berubah' },
    { code: 'D', name: 'Suka Pekerjaan yang Terperinci' },
    { code: 'C', name: 'Suka Pekerjaan yang Teratur' },
    { code: 'R', name: 'Tipe Teoritis' },
    { code: 'O', name: 'Kebtutuhan Mendekati dan Menyayangi' },
    { code: 'T', name: 'Tempo Kerja' },
    { code: 'E', name: 'Pengendalian Emosi' },
    { code: 'F', name: 'Dukungan Untuk Atasan' },
    { code: 'W', name: 'Kebutuhan Untuk Taat Aturan Dan Arahan' },
];

export default function PapiKostickSettings({ auth, questions: initialQuestions }: PapiKostickSettingsProps) {
    const [questions, setQuestions] = useState<PapiKostickQuestion[]>(initialQuestions);
    const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);

    const { data, setData, put, processing, errors, reset } = useForm<Omit<PapiKostickQuestion, 'id' | 'is_completed'>>({
        
        statement_a: '', // Menggunakan statement_a
        choice_a_trait: '',
        statement_b: '', // Menggunakan statement_b
        choice_b_trait: '',
    });

    useEffect(() => {
        if (questions.length > 0) {
            setSelectedQuestionId(questions[0].id);
        }
    }, [questions]);

    useEffect(() => {
        if (selectedQuestionId !== null) {
            const questionToEdit = questions.find(q => q.id === selectedQuestionId);
            if (questionToEdit) {
                setData({
                    statement_a: questionToEdit.statement_a, // Menggunakan statement_a
                    choice_a_trait: questionToEdit.choice_a_trait,
                    statement_b: questionToEdit.statement_b, // Menggunakan statement_b
                    choice_b_trait: questionToEdit.choice_b_trait,
                });
            }
        } else {
            reset();
        }
    }, [selectedQuestionId, questions, setData, reset]);

    const handleSelectQuestion = (id: number) => {
        setSelectedQuestionId(id);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setData(e.target.name as keyof typeof data, e.target.value);
    };

  
	function handleSave(e) {
	  e.preventDefault(); // 🧠 penting!
	  put(route('admin.papikostick.updateQuestion', selectedQuestionId), {
		preserveScroll: true,
		onSuccess: () => {
		  Swal.fire({
			icon: 'success',
			title: 'Berhasil',
			text: 'Soal berhasil diperbarui!',
			position: 'top-end',
			toast: true,
			timer: 3000,
			showConfirmButton: false,
		  });
		},
		onError: () => {
		  Swal.fire({
			icon: 'error',
			title: 'Gagal',
			text: 'Gagal memperbarui soal. Cek input kamu.',
			position: 'top-end',
			toast: true,
			timer: 3000,
			showConfirmButton: false,
		  });
		},
	  });
	}

    const handleNavigate = (direction: 'prev' | 'next') => {
        if (selectedQuestionId === null) return;

        let newId = selectedQuestionId;
        if (direction === 'prev') {
            newId = Math.max(1, selectedQuestionId - 1);
        } else {
            newId = Math.min(questions.length, selectedQuestionId + 1);
        }
        setSelectedQuestionId(newId);
    };

    return (
        <>
            <Head title="Pengaturan Soal PapiKostick" />

            <AdminLayout auth={auth} pageTitle="Pengaturan Soal PapiKostick">
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    Kelola dan perbarui pertanyaan serta pilihan untuk tes PapiKostick.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Panel Kiri: Daftar Soal & Navigasi */}
                    <div className="lg:col-span-1 bg-white dark:bg-[#1e1e1e] rounded-lg shadow-md p-6 overflow-hidden">
                        <h2 className="text-xl font-semibold text-[#1b1b18] dark:text-white mb-4">Daftar Soal ({questions.length})</h2>
                        <div className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            {questions.map((q) => (
                                <div
                                    key={q.id}
                                    onClick={() => handleSelectQuestion(q.id)}
                                    className={`flex items-center justify-between p-3 mb-2 rounded-md cursor-pointer transition-colors duration-200
                                        ${selectedQuestionId === q.id
                                            ? 'bg-[#DBA552] text-white shadow-md'
                                            : 'bg-gray-50 dark:bg-[#2a2a2a] text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#3a3a3a]'
                                        }
                                    `}
                                >
                                    <span className="font-medium">Soal {q.id}</span>
                                    {q.is_completed ? (
                                        <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <svg className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.3 2.671-1.3 3.436 0L14.907 10H5.093L8.257 3.099zM10 15a1 1 0 100-2 1 1 0 000 2zm0 0h.01" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Panel Kanan: Area Pengeditan Soal */}
                    <div className="lg:col-span-2 bg-white dark:bg-[#1e1e1e] rounded-lg shadow-md p-6">
                        {selectedQuestionId === null ? (
                            <p className="text-gray-600 dark:text-gray-400 text-center py-10">
                                Pilih soal dari daftar di samping untuk mulai mengedit.
                            </p>
                        ) : (
                            <>
                                <h2 className="text-xl font-semibold text-[#1b1b18] dark:text-white mb-4">
                                    Edit Soal {selectedQuestionId}
                                </h2>
                                <div className="space-y-6">

                                    {/* Pilihan A */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="statement_a" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Pilihan A
                                            </label>
                                            <input
                                                type="text"
                                                id="statement_a"
                                                name="statement_a"
                                                value={data.statement_a}
                                                onChange={handleChange}
                                                className="w-full text-sm rounded-md border-gray-300 dark:bg-[#2a2a2a] dark:border-gray-700 dark:text-white focus:border-[#DBA552] focus:ring-[#DBA552] p-2 bg-[#f8f8f8]"
                                                placeholder="Teks pilihan A"
                                            />
                                            {errors.statement_a && <div className="text-red-500 text-xs mt-1">{errors.statement_a}</div>}
                                        </div>
                                        <div>
                                            <label htmlFor="choice_a_trait" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Sifat PapiKostick (Pilihan A)
                                            </label>
                                            <select
                                                id="choice_a_trait"
                                                name="choice_a_trait"
                                                value={data.choice_a_trait || ''}
                                                onChange={handleChange}
                                                className="w-full text-sm rounded-md border-gray-300 dark:bg-[#2a2a2a] dark:border-gray-700 dark:text-white focus:border-[#DBA552] focus:ring-[#DBA552] p-2 bg-[#f8f8f8]"
                                            >
                                                <option value="">Pilih Sifat</option>
                                                {PAPI_KOSTICK_TRAITS.map(trait => (
                                                    <option key={trait.code} value={trait.code}>
                                                        {trait.code} - {trait.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.choice_a_trait && <div className="text-red-500 text-xs mt-1">{errors.choice_a_trait}</div>}
                                        </div>
                                    </div>

                                    {/* Pilihan B */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="statement_b" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Pilihan B
                                            </label>
                                            <input
                                                type="text"
                                                id="statement_b"
                                                name="statement_b"
                                                value={data.statement_b}
                                                onChange={handleChange}
                                                className="w-full text-sm rounded-md border-gray-300 dark:bg-[#2a2a2a] dark:border-gray-700 dark:text-white focus:border-[#DBA552] focus:ring-[#DBA552] p-2 bg-[#f8f8f8]"
                                                placeholder="Teks pilihan B"
                                            />
                                            {errors.statement_b && <div className="text-red-500 text-xs mt-1">{errors.statement_b}</div>}
                                        </div>
                                        <div>
                                            <label htmlFor="choice_b_trait" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Sifat PapiKostick (Pilihan B)
                                            </label>
                                            <select
                                                id="choice_b_trait"
                                                name="choice_b_trait"
                                                value={data.choice_b_trait || ''}
                                                onChange={handleChange}
                                                className="w-full text-sm rounded-md border-gray-300 dark:bg-[#2a2a2a] dark:border-gray-700 dark:text-white focus:border-[#DBA552] focus:ring-[#DBA552] p-2 bg-[#f8f8f8]"
                                            >
                                                <option value="">Pilih Sifat</option>
                                                {PAPI_KOSTICK_TRAITS.map(trait => (
                                                    <option key={trait.code} value={trait.code}>
                                                        {trait.code} - {trait.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.choice_b_trait && <div className="text-red-500 text-xs mt-1">{errors.choice_b_trait}</div>}
                                        </div>
                                    </div>

                                    {/* Tombol Aksi */}
                                    <div className="flex flex-wrap justify-center sm:justify-end gap-3 pt-4"> {/* Perubahan di sini */}
                                        <button
                                            onClick={() => handleNavigate('prev')}
                                            disabled={selectedQuestionId === 1}
                                            className={`px-5 py-2 rounded-md text-base text-sm transition-colors duration-200
                                                ${selectedQuestionId === 1
                                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                    : 'bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white'
                                                }
                                            `}
                                        >
                                            Sebelumnya
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleSave}
                                            disabled={processing}
                                            className={`px-5 py-2 rounded-md text-base text-sm text-white ${processing
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
                                                    Menyimpan...
                                                </span>
                                            ) : 'Simpan Perubahan'}
                                        </button>
                                        <button
                                            onClick={() => handleNavigate('next')}
                                            disabled={selectedQuestionId === questions.length}
                                            className={`px-5 py-2 rounded-md text-base text-sm transition-colors duration-200
                                                ${selectedQuestionId === questions.length
                                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                    : 'bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white'
                                                }
                                            `}
                                        >
                                            Berikutnya
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </AdminLayout>
        </>
    );
}
