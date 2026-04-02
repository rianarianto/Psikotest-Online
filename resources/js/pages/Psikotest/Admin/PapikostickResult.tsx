import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import type { SharedData } from '@/types';

// Interface untuk struktur data peserta yang diterima dari backend
interface ParticipantData {
    id: number;
    name: string;
    email: string;
    papi_test_status: string; // 'not_started', 'in_progress', 'completed'
    papi_answers_count: number; // Jumlah jawaban yang sudah ada
}

// Interface untuk props halaman PapikostickResult (index hasil)
interface PapikostickResultProps extends SharedData {
    participants: ParticipantData[];
    traitsList: string[]; // Hanya daftar kode sifat (misal: ['N', 'G', 'A', ...])
}

export default function PapikostickResult() {
    const { participants, auth } = usePage<PapikostickResultProps>().props;

    return (
        <>
            <Head title="Hasil Tes PapiKostick" />

            <AdminLayout auth={auth} pageTitle="Hasil Tes PapiKostick">
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    Lihat daftar peserta yang telah mengikuti tes PapiKostick dan akses detail hasilnya.
                </p>

                <div className="bg-white dark:bg-[#1e1e1e] rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-[#1b1b18] dark:text-white mb-4">Daftar Peserta Tes PapiKostick</h2>

                    {participants.length === 0 ? (
                        <p className="text-gray-600 dark:text-gray-400 text-center py-10">
                            Belum ada peserta yang menyelesaikan tes PapiKostick.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-[#2a2a2a]">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Nama Peserta
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Status Tes
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Jumlah Jawaban
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-[#1e1e1e] divide-y divide-gray-200 dark:divide-gray-700">
                                    {participants.map((participant) => (
                                        <tr key={participant.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                {participant.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                {participant.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                                    ${participant.papi_test_status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}
                                                    ${participant.papi_test_status === 'in_progress' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : ''}
                                                    ${participant.papi_test_status === 'not_started' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' : ''}
                                                `}>
                                                    {participant.papi_test_status.replace('_', ' ').toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                {participant.papi_answers_count}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                                                <Link
                                                    href={route('admin.papikostick.showResult', participant.id)}
                                                    className="text-[#DBA552] hover:text-[#BC8024] dark:text-[#DBA552] dark:hover:text-[#BC8024]"
                                                >
                                                    Lihat Hasil
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </AdminLayout>
        </>
    );
}
