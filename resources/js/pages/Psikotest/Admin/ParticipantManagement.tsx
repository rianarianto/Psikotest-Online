import React, { useState, useMemo } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import type { SharedData } from '@/types';

// Interface untuk struktur data peserta yang diterima dari backend
interface ParticipantData {
    id: number;
    name: string;
    email: string;
    age: number;
    position: string;
    institution: string;
    token_id: number;
    papi_test_status: string;
    papi_test_started_at: string | null;
    test_completed_at: string | null;
    created_at: string;
    token_type: string;
}

// Interface untuk props halaman ParticipantManagement
interface ParticipantManagementProps extends SharedData {
    participants: ParticipantData[];
}

export default function ParticipantManagement() {
    const { auth, participants } = usePage<ParticipantManagementProps>().props;

    // State untuk pengurutan tabel
    const [sortColumn, setSortColumn] = useState<keyof ParticipantData | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    // State untuk pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // State untuk pencarian
    const [searchQuery, setSearchQuery] = useState('');

    // Handler untuk sorting kolom
    const handleSort = (column: keyof ParticipantData) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
        setCurrentPage(1);
    };

    // Filter dan sort data
    const filteredAndSortedParticipants = useMemo(() => {
        let filtered = [...participants];

        // Filter berdasarkan search query
        if (searchQuery) {
            const lowerCaseQuery = searchQuery.toLowerCase();
            filtered = filtered.filter(participant =>
                participant.name.toLowerCase().includes(lowerCaseQuery) ||
                participant.email.toLowerCase().includes(lowerCaseQuery) ||
                participant.position?.toLowerCase().includes(lowerCaseQuery) ||
                participant.institution?.toLowerCase().includes(lowerCaseQuery) ||
                participant.token_type?.toLowerCase().includes(lowerCaseQuery) ||
                participant.papi_test_status?.toLowerCase().includes(lowerCaseQuery)
            );
        }

        // Sort jika ada kolom yang dipilih
        if (!sortColumn) return filtered;

        return filtered.sort((a, b) => {
            const aValue = a[sortColumn];
            const bValue = b[sortColumn];

            if (aValue === null || aValue === undefined) return sortDirection === 'asc' ? 1 : -1;
            if (bValue === null || bValue === undefined) return sortDirection === 'asc' ? -1 : 1;

            // Sort string
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                if (sortColumn === 'created_at' || sortColumn === 'papi_test_started_at' || sortColumn === 'test_completed_at') {
                    const dateA = new Date(aValue).getTime();
                    const dateB = new Date(bValue).getTime();
                    return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
                }
                const comparison = aValue.localeCompare(bValue, undefined, { sensitivity: 'base' });
                return sortDirection === 'asc' ? comparison : -comparison;
            }

            // Sort number
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
            }

            return 0;
        });
    }, [participants, searchQuery, sortColumn, sortDirection]);

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredAndSortedParticipants.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredAndSortedParticipants.length / itemsPerPage);

    const handlePageChange = (pageNumber: number) => setCurrentPage(pageNumber);

    const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setItemsPerPage(parseInt(e.target.value));
        setCurrentPage(1);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    // Icon untuk menunjukkan arah sort
    const getSortIcon = (column: keyof ParticipantData) => {
        if (sortColumn === column) {
            return sortDirection === 'asc' ? ' ▲' : ' ▼';
        }
        return '';
    };

    // Helper untuk format jenis tes
    const formatTestType = (type: string) => {
        switch (type) {
            case 'papi': return 'PapiKostick';
            case 'kraepelin': return 'Kraepelin';
            case 'alltest': return 'Papi & Kraepelin';
            default: return type || '-';
        }
    };

    return (
        <>
            <Head title="Data Peserta" />

            <AdminLayout auth={auth} pageTitle="Data Peserta">
                <p className="text-gray-600 dark:text-gray-400 mb-8">Daftar lengkap peserta yang telah mengisi biodata.</p>

                {participants.length === 0 && !searchQuery ? (
                    <p className="text-gray-600 dark:text-gray-400 text-center py-10">Belum ada peserta yang terdaftar.</p>
                ) : (
                    <div className="w-100% box-border border-solid border-1 border-black/5 bg-white dark:bg-[#1e1e1e] rounded-lg shadow-md p-6">
                        {/* Search Input */}
                        <div className="relative lg:w-sm md:w-sm border-solid border-1 rounded-md mb-4">
                            <input
                                type="text"
                                placeholder="Cari peserta..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="w-full pl-10 pr-4 py-2 rounded-md border-gray-300 dark:bg-[#2a2a2a] dark:border-gray-700 dark:text-white focus:border-[#DBA552] focus:ring-[#DBA552] text-sm"
                            />
                            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                        </div>

                        {/* Items per page selector */}
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-2">
                            <div className="flex items-center gap-4">
                                <div>
                                    <label htmlFor="itemsPerPage" className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Tampilkan:</label>
                                    <select
                                        id="itemsPerPage"
                                        value={itemsPerPage}
                                        onChange={handleItemsPerPageChange}
                                        className="rounded-md border-gray-300 dark:bg-[#2a2a2a] dark:border-gray-700 dark:text-white text-sm p-1"
                                    >
                                        <option value={5}>5</option>
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                    </select>
                                    <span className="text-sm text-gray-700 dark:text-gray-300 ml-2">item per halaman</span>
                                </div>
                            </div>
                            <div className="text-sm text-gray-700 dark:text-gray-300 md:mt-0">
                                Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredAndSortedParticipants.length)} dari {filteredAndSortedParticipants.length} peserta
                            </div>
                        </div>

                        {filteredAndSortedParticipants.length === 0 && searchQuery ? (
                            <p className="text-gray-600 dark:text-gray-400 text-center py-10">Tidak ada peserta yang cocok dengan pencarian Anda.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-[#2a2a2a]">
                                        <tr>
                                            <th scope="col" className="relative px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase whitespace-nowrap">
                                                Aksi
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer whitespace-nowrap"
                                                onClick={() => handleSort('name')}>
                                                Nama {getSortIcon('name')}
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer whitespace-nowrap"
                                                onClick={() => handleSort('email')}>
                                                Email {getSortIcon('email')}
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer whitespace-nowrap"
                                                onClick={() => handleSort('age')}>
                                                Usia {getSortIcon('age')}
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer whitespace-nowrap"
                                                onClick={() => handleSort('position')}>
                                                Posisi {getSortIcon('position')}
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer whitespace-nowrap"
                                                onClick={() => handleSort('institution')}>
                                                Institusi {getSortIcon('institution')}
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer whitespace-nowrap"
                                                onClick={() => handleSort('token_type')}>
                                                Jenis Tes {getSortIcon('token_type')}
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer whitespace-nowrap"

                                                onClick={() => handleSort('papi_test_status')}>
                                                Status {getSortIcon('papi_test_status')}
                                            </th>
                                            {/* Kolom Jawaban Benar dihapus sesuai request */}
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer whitespace-nowrap"
                                                onClick={() => handleSort('papi_test_started_at')}>
                                                Mulai Test {getSortIcon('papi_test_started_at')}
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer whitespace-nowrap"
                                                onClick={() => handleSort('test_completed_at')}>
                                                Selesai Test {getSortIcon('test_completed_at')}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-[#1e1e1e] divide-y divide-gray-200 dark:divide-gray-700">
                                        {currentItems.map((participant) => (
                                            <tr key={participant.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <Link href={route('admin.papikostick.showResult', participant.id)} className="text-[#DBA552] hover:text-[#BC8024]">
                                                        Lihat Hasil
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                    {participant.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                    {participant.email}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                    {participant.age}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                    {participant.position}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                    {participant.institution}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                    {formatTestType(participant.token_type)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                                        ${participant.papi_test_status === 'not_started' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' : ''}
                                                        ${participant.papi_test_status === 'in_progress' ? 'bg-yellow-100 text-yellow-800 dark:bg-blue-900 dark:text-blue-200' : ''}
                                                        ${participant.papi_test_status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}
                                                        ${participant.papi_test_status === 'incomplete' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : ''}
                                                    `}>
                                                        {participant.papi_test_status === 'incomplete' ? 'TIDAK SELESAI' : (participant.papi_test_status ? participant.papi_test_status.replace('_', ' ').toUpperCase() : 'N/A')}
                                                    </span>
                                                </td>
                                                {/* Kolom Jawaban Benar dihapus */}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                    {participant.papi_test_started_at ? new Date(participant.papi_test_started_at).toLocaleString() : '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                    {participant.test_completed_at ? new Date(participant.test_completed_at).toLocaleString() : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex justify-between items-center mt-6">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 text-sm font-medium text-white bg-[#DBA552] rounded-md hover:bg-[#BC8024] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                >
                                    Sebelumnya
                                </button>
                                <span className="text-gray-700 dark:text-gray-300">
                                    Halaman {currentPage} dari {totalPages}
                                </span>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 text-sm font-medium text-white bg-[#DBA552] rounded-md hover:bg-[#BC8024] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                >
                                    Selanjutnya
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </AdminLayout>
        </>
    );
}
