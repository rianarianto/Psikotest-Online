import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import AdminLayout from '@/layouts/AdminLayout';
import type { SharedData } from '@/types';

// Interface untuk data token
interface TokenData {
    id: number;
    token: string;
    test_type: string;
    status: 'unused' | 'in_progress' | 'used' | 'expired';
    test_status: 'not_started' | 'in_progress' | 'completed' | 'incomplete'; // Status tes yang sebenarnya
    completed_tests: number;
    total_tests: number;
    expires_at: string | null;
    used_by_participant_id: number | null;
    used_by_participant_name: string | null;
    used_by_participant_email: string | null;
    used_at: string | null;
    created_at: string;
    intended_for_name: string | null;
    intended_for_email: string | null;
}

interface TokenManagementProps extends SharedData {
    tokens: TokenData[];
    totalTokens: number;
    unusedTokens: number;
    inProgressTokens: number;
    usedTokens: number;
    expiredTokens: number;
}

export default function TokenManagement() {
    const { tokens, flash, auth, totalTokens, unusedTokens, inProgressTokens, usedTokens, expiredTokens } = usePage<TokenManagementProps>().props;

    // State untuk pengurutan
    const [sortColumn, setSortColumn] = useState<keyof TokenData>('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    // State untuk paginasi
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [goToPageInput, setGoToPageInput] = useState('');

    // Form untuk membuat token baru
    const { data, setData, post, processing, errors, reset } = useForm({
        test_type: [] as string[],
        quantity: 1,
        intended_for_name: '',
        intended_for_email: '',
        expires_at: '',
    });

    // Set default expires_at (24 jam dari sekarang)
    useEffect(() => {
        const date = new Date();
        date.setHours(date.getHours() + 24);
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        setData('expires_at', date.toISOString().slice(0, 16));
    }, []);

    // Track last shown notification to prevent duplicates
    const lastSuccessRef = useRef<string | null>(null);
    const lastErrorRef = useRef<string | null>(null);

    // Flash messages using SweetAlert2 (Premium Toast Mode)
    useEffect(() => {
        if (flash?.success && flash.success !== lastSuccessRef.current) {
            Swal.fire({
                icon: 'success',
                title: 'Berhasil',
                text: flash.success,
                timer: 4000,
                showConfirmButton: false,
                showCloseButton: true, // Enable close button
                position: 'top-end',
                toast: true,
                timerProgressBar: true,
            });
            lastSuccessRef.current = flash.success;
        }

        if (flash?.error && flash.error !== lastErrorRef.current) {
            Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: flash.error,
                timer: 5000,
                showConfirmButton: false,
                showCloseButton: true, // Enable close button
                position: 'top-end',
                toast: true,
                timerProgressBar: true,
            });
            lastErrorRef.current = flash.error;
        }

        // Reset tracking when flash is cleared to allow same message to appear again on next action
        if (!flash?.success) lastSuccessRef.current = null;
        if (!flash?.error) lastErrorRef.current = null;
    }, [flash]);


    // Logic untuk quantity vs intended_for
    useEffect(() => {
        const isIntendedForFilled = data.intended_for_name.trim() !== '' || data.intended_for_email.trim() !== '';
        if (isIntendedForFilled && data.quantity !== 1) {
            setData('quantity', 1);
        }
    }, [data.intended_for_name, data.intended_for_email]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.tokens.store'), {
            onSuccess: () => {
                reset();
                setCurrentPage(1);
            },
            onError: () => {
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal Membuat Token',
                    text: 'Mohon periksa kembali data yang Anda masukkan.',
                    timer: 5000,
                    showConfirmButton: false,
                    showCloseButton: true,
                    position: 'top-end',
                    toast: true,
                    timerProgressBar: true,
                });
            },
        });
    };

    const handleDelete = (token: TokenData) => {
        if (token.status !== 'unused') {
            Swal.fire({
                icon: 'error',
                title: 'Tidak Dapat Menghapus',
                text: 'Token hanya dapat dihapus jika statusnya "unused".',
                timer: 4000,
                showConfirmButton: false,
                showCloseButton: true,
                position: 'top-end',
                toast: true,
                timerProgressBar: true,
            });
            return;
        }

        Swal.fire({
            title: `Hapus token "${token.token}"?`,
            text: "Tindakan ini tidak dapat dibatalkan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DBA552',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.tokens.destroy', token.id));
            }
        });
    };

    // Sorting
    const handleSort = (column: keyof TokenData) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('desc');
        }
        setCurrentPage(1);
    };

    const sortedTokens = useMemo(() => {
        return [...tokens].sort((a, b) => {
            const aVal = a[sortColumn];
            const bVal = b[sortColumn];
            if (aVal === null) return sortDirection === 'asc' ? -1 : 1;
            if (bVal === null) return sortDirection === 'asc' ? 1 : -1;
            if (typeof aVal === 'string' && typeof bVal === 'string') {
                return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            }
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
            }
            return 0;
        });
    }, [tokens, sortColumn, sortDirection]);

    // Pagination
    const totalPages = Math.ceil(sortedTokens.length / itemsPerPage);
    const paginatedTokens = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return sortedTokens.slice(start, start + itemsPerPage);
    }, [sortedTokens, currentPage, itemsPerPage]);

    const getSortIcon = (column: keyof TokenData) => sortColumn === column ? (sortDirection === 'asc' ? ' ▲' : ' ▼') : '';

    // Helper untuk format jenis tes
    const formatTestType = (type: string) => {
        return String(type || '').replace(/[\[\]" ]/g, '').split(',').filter(Boolean).map(t => {
            if (t === 'papi') return 'PapiKostick';
            if (t === 'kraepelin') return 'Kraepelin';
            return t;
        }).join(' & ');
    };

    // Helper untuk format status tes
    const getTestStatusBadge = (token: TokenData) => {
        if (token.test_status === 'completed') {
            return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">SELESAI</span>;
        } else if (token.test_status === 'in_progress') {
            return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">BERLANGSUNG</span>;
        } else if (token.test_status === 'incomplete') {
            return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">TIDAK SELESAI</span>;
        }
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">BELUM MULAI</span>;
    };

    return (
        <>
            <Head title="Manajemen Token" />

            <AdminLayout auth={auth} pageTitle="Manajemen Token">
                <p className="text-gray-600 dark:text-gray-400 mb-8">Kelola token akses untuk peserta tes psikotes.</p>

                {/* Form dan Ringkasan */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">
                    {/* Form Buat Token */}
                    <div className="lg:col-span-3 bg-white dark:bg-[#1e1e1e] rounded-lg shadow-md p-6 border border-black/5">
                        <h2 className="text-xl font-semibold text-[#1b1b18] dark:text-white mb-4">Buat Token Baru</h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Jenis Tes */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Jenis Tes</label>
                                    <div className="flex flex-wrap gap-4 p-2 rounded-lg dark:bg-[#2a2a2a] bg-[#f8f8f8]">
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                value="papi"
                                                checked={data.test_type.includes('papi')}
                                                onChange={(e) => {
                                                    const newVal = e.target.checked
                                                        ? [...data.test_type, 'papi']
                                                        : data.test_type.filter(t => t !== 'papi');
                                                    setData('test_type', newVal);
                                                }}
                                                className="rounded border-gray-300 text-[#DBA552] focus:ring-[#DBA552]"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">PapiKostick</span>
                                        </label>
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                value="kraepelin"
                                                checked={data.test_type.includes('kraepelin')}
                                                onChange={(e) => {
                                                    const newVal = e.target.checked
                                                        ? [...data.test_type, 'kraepelin']
                                                        : data.test_type.filter(t => t !== 'kraepelin');
                                                    setData('test_type', newVal);
                                                }}
                                                className="rounded border-gray-300 text-[#DBA552] focus:ring-[#DBA552]"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">Kraepelin</span>
                                        </label>
                                    </div>
                                    {errors.test_type && <p className="mt-1 text-xs text-red-600">{errors.test_type}</p>}
                                </div>
                                {/* Expires At */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Berlaku Sampai</label>
                                    <input
                                        type="datetime-local"
                                        value={data.expires_at}
                                        onChange={(e) => setData('expires_at', e.target.value)}
                                        className="w-full text-sm rounded-md border-gray-300 dark:bg-[#2a2a2a] dark:border-gray-700 dark:text-white focus:border-[#DBA552] focus:ring-[#DBA552] p-2 bg-[#f8f8f8]"
                                    />
                                    {errors.expires_at && <p className="mt-1 text-xs text-red-600">{errors.expires_at}</p>}
                                </div>
                                {/* Quantity */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Jumlah Token</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={data.quantity}
                                        onChange={(e) => setData('quantity', parseInt(e.target.value))}
                                        disabled={data.intended_for_name.trim() !== '' || data.intended_for_email.trim() !== ''}
                                        className="w-full text-sm rounded-md border-gray-300 dark:bg-[#2a2a2a] dark:border-gray-700 dark:text-white focus:border-[#DBA552] focus:ring-[#DBA552] p-2 bg-[#f8f8f8] disabled:opacity-50"
                                    />
                                    {errors.quantity && <p className="mt-1 text-xs text-red-600">{errors.quantity}</p>}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Intended For Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nama Peserta (Opsional)</label>
                                    <input
                                        type="text"
                                        value={data.intended_for_name}
                                        onChange={(e) => setData('intended_for_name', e.target.value)}
                                        placeholder="Nama peserta yang dituju"
                                        disabled={data.quantity > 1}
                                        className="w-full text-sm rounded-md border-gray-300 dark:bg-[#2a2a2a] dark:border-gray-700 dark:text-white focus:border-[#DBA552] focus:ring-[#DBA552] p-2 bg-[#f8f8f8] disabled:opacity-50"
                                    />
                                </div>
                                {/* Intended For Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Peserta (Opsional)</label>
                                    <input
                                        type="email"
                                        value={data.intended_for_email}
                                        onChange={(e) => setData('intended_for_email', e.target.value)}
                                        placeholder="Email peserta yang dituju"
                                        disabled={data.quantity > 1}
                                        className="w-full text-sm rounded-md border-gray-300 dark:bg-[#2a2a2a] dark:border-gray-700 dark:text-white focus:border-[#DBA552] focus:ring-[#DBA552] p-2 bg-[#f8f8f8] disabled:opacity-50"
                                    />
                                </div>
                            </div>
                            <div>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className={`px-8 py-2 rounded-md text-sm font-medium text-white ${processing ? 'bg-gray-400' : 'bg-[#DBA552] hover:bg-[#BC8024]'} transition-colors`}
                                >
                                    {processing ? 'Membuat...' : 'Buat Token'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Ringkasan Token */}
                    <div className="lg:col-span-2 bg-white dark:bg-[#1e1e1e] rounded-lg shadow-md p-6 border border-black/5">
                        <h2 className="text-xl font-semibold text-[#1b1b18] dark:text-white mb-4">Ringkasan</h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="text-center rounded-xl bg-[#f8f8f8] dark:bg-[#2a2a2a] p-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Token Tersedia</p>
                                    <p className="text-4xl font-bold text-green-600">{unusedTokens}</p>
                                </div>
                                <div className="text-center rounded-xl bg-[#f8f8f8] dark:bg-[#2a2a2a] p-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Token Kadaluarsa</p>
                                    <p className="text-4xl font-bold text-red-600">{expiredTokens}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="text-center rounded-lg bg-[#f8f8f8] dark:bg-[#2a2a2a] p-3">
                                    <p className="text-sm text-gray-500">Tes Berlangsung</p>
                                    <p className="text-4xl font-bold text-yellow-600">{inProgressTokens}</p>
                                </div>
                                <div className="text-center rounded-lg bg-[#f8f8f8] dark:bg-[#2a2a2a] p-3">
                                    <p className="text-sm text-gray-500">Tes Selesai</p>
                                    <p className="text-4xl font-bold text-gray-600">{usedTokens}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Daftar Token */}
                <div className="bg-white dark:bg-[#1e1e1e] rounded-lg shadow-md p-6 border border-black/5">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-[#1b1b18] dark:text-white">Daftar Token</h2>
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-600 dark:text-gray-400">Tampilkan:</label>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => { setItemsPerPage(parseInt(e.target.value)); setCurrentPage(1); }}
                                className="rounded-md border-gray-300 dark:bg-[#2a2a2a] dark:border-gray-700 dark:text-white text-sm p-1"
                            >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                            </select>
                        </div>
                    </div>

                    {paginatedTokens.length === 0 ? (
                        <p className="text-gray-600 dark:text-gray-400 text-center py-10">Belum ada token.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-[#2a2a2a]">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase cursor-pointer" onClick={() => handleSort('token')}>
                                            Token {getSortIcon('token')}
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase cursor-pointer" onClick={() => handleSort('test_type')}>
                                            Jenis Tes {getSortIcon('test_type')}
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase cursor-pointer" onClick={() => handleSort('status')}>
                                            Status Token {getSortIcon('status')}
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase cursor-pointer" onClick={() => handleSort('test_status')}>
                                            Status Tes {getSortIcon('test_status')}
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                            Peserta
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase cursor-pointer" onClick={() => handleSort('created_at')}>
                                            Dibuat {getSortIcon('created_at')}
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase cursor-pointer" onClick={() => handleSort('expires_at')}>
                                            Berlaku {getSortIcon('expires_at')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-[#1e1e1e] divide-y divide-gray-200 dark:divide-gray-700">
                                    {paginatedTokens.map((token) => (
                                        <tr key={token.id}>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-mono font-medium text-gray-900 dark:text-white">
                                                {token.token}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                {formatTestType(token.test_type)}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full
                                                    ${token.status === 'unused' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}
                                                    ${token.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : ''}
                                                    ${token.status === 'used' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' : ''}
                                                    ${token.status === 'expired' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : ''}
                                                `}>
                                                    {token.status === 'unused' ? 'TERSEDIA' : token.status === 'in_progress' ? 'DIGUNAKAN' : token.status === 'expired' ? 'KADALUARSA' : 'SELESAI'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                {getTestStatusBadge(token)}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                <div>
                                                    <div className="font-medium">{token.used_by_participant_name || token.intended_for_name || '-'}</div>
                                                    <div className="text-xs text-gray-500">{token.used_by_participant_email || token.intended_for_email || ''}</div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                {token.created_at}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                {token.expires_at || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    {/* Info */}
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, sortedTokens.length)} dari {sortedTokens.length} token
                                    </div>

                                    {/* Page Numbers */}
                                    <div className="flex items-center gap-1">
                                        {/* First Page */}
                                        <button
                                            onClick={() => setCurrentPage(1)}
                                            disabled={currentPage === 1}
                                            className={`px-3 py-1.5 rounded-md text-sm font-medium ${currentPage === 1 ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300'} transition-colors`}
                                            title="Halaman Pertama"
                                        >
                                            «
                                        </button>

                                        {/* Previous */}
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className={`px-3 py-1.5 rounded-md text-sm font-medium ${currentPage === 1 ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300'} transition-colors`}
                                        >
                                            ‹
                                        </button>

                                        {/* Page Numbers */}
                                        {(() => {
                                            const pages: (number | string)[] = [];
                                            const showPages = 5;
                                            let start = Math.max(1, currentPage - Math.floor(showPages / 2));
                                            let end = Math.min(totalPages, start + showPages - 1);
                                            if (end - start + 1 < showPages) {
                                                start = Math.max(1, end - showPages + 1);
                                            }

                                            if (start > 1) {
                                                pages.push(1);
                                                if (start > 2) pages.push('...');
                                            }
                                            for (let i = start; i <= end; i++) {
                                                pages.push(i);
                                            }
                                            if (end < totalPages) {
                                                if (end < totalPages - 1) pages.push('...');
                                                pages.push(totalPages);
                                            }

                                            return pages.map((page, idx) => (
                                                page === '...' ? (
                                                    <span key={`ellipsis-${idx}`} className="px-2 text-gray-500">...</span>
                                                ) : (
                                                    <button
                                                        key={page}
                                                        onClick={() => setCurrentPage(page as number)}
                                                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${currentPage === page ? 'bg-[#DBA552] text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300'}`}
                                                    >
                                                        {page}
                                                    </button>
                                                )
                                            ));
                                        })()}

                                        {/* Next */}
                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className={`px-3 py-1.5 rounded-md text-sm font-medium ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300'} transition-colors`}
                                        >
                                            ›
                                        </button>

                                        {/* Last Page */}
                                        <button
                                            onClick={() => setCurrentPage(totalPages)}
                                            disabled={currentPage === totalPages}
                                            className={`px-3 py-1.5 rounded-md text-sm font-medium ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300'} transition-colors`}
                                            title="Halaman Terakhir"
                                        >
                                            »
                                        </button>
                                    </div>

                                    {/* Go to Page */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Ke halaman:</span>
                                        <input
                                            type="number"
                                            min="1"
                                            max={totalPages}
                                            value={goToPageInput}
                                            onChange={(e) => setGoToPageInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    const page = parseInt(goToPageInput);
                                                    if (page >= 1 && page <= totalPages) {
                                                        setCurrentPage(page);
                                                        setGoToPageInput('');
                                                    }
                                                }
                                            }}
                                            placeholder={currentPage.toString()}
                                            className="w-16 px-2 py-1 text-sm rounded-md border border-gray-300 dark:border-gray-600 dark:bg-[#2a2a2a] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#DBA552]"
                                        />
                                        <button
                                            onClick={() => {
                                                const page = parseInt(goToPageInput);
                                                if (page >= 1 && page <= totalPages) {
                                                    setCurrentPage(page);
                                                    setGoToPageInput('');
                                                }
                                            }}
                                            className="px-3 py-1.5 bg-[#DBA552] hover:bg-[#BC8024] text-white text-sm font-medium rounded-md transition-colors"
                                        >
                                            Go
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </AdminLayout>
        </>
    );
}
