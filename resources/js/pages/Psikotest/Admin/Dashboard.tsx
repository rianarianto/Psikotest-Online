import React, { useEffect, useMemo, useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import type { SharedData } from '@/types';

// Interface untuk statistik yang diterima dari backend
interface DashboardStats {
    totalParticipants: number;
    completedTests: number;
    activeTests: number;
    notStartedTests: number;
    totalTokens: number;
    totalRegisteredUsers: number;
}

// Interface untuk tes peserta
interface ParticipantTestInfo {
    id: number;
    status: 'not_started' | 'in_progress' | 'completed';
    test_type: {
        id: number;
        name: string;
        code: string;
    };
}

// Interface untuk peserta terbaru
interface LatestParticipant {
    id: number;
    name: string;
    age: number;
    position: string;
    status: 'not_started' | 'in_progress' | 'completed' | 'incomplete';
}

// Interface untuk data chart bulanan dari backend
interface MonthlyTestCount {
    month: number; // Nomor bulan (1-12)
    count: number;
}

// Interface untuk props halaman Dashboard
interface DashboardProps extends SharedData {
    stats: DashboardStats;
    latestParticipants: LatestParticipant[];
    monthlyTestCounts: MonthlyTestCount[]; // Prop baru untuk data chart bulanan
    availableYears: number[]; // Prop baru untuk daftar tahun yang tersedia
    selectedYear: number; // Prop baru untuk tahun yang sedang dipilih
}

export default function Dashboard() {
    const { auth, stats, latestParticipants, monthlyTestCounts, availableYears, selectedYear: initialSelectedYear } = usePage<DashboardProps>().props;

    // State untuk tahun yang dipilih
    const [currentYear, setCurrentYear] = useState<number>(initialSelectedYear);


    // Efek untuk memuat ulang data saat tahun berubah
    useEffect(() => {
        if (currentYear !== initialSelectedYear) {
            router.get(route('dashboard', { year: currentYear }), {}, {
                preserveState: true,
                preserveScroll: true,
            });
        }
    }, [currentYear, initialSelectedYear]);


    // Memproses monthlyTestCounts untuk grafik
    const processedChartData = useMemo(() => {
        const monthNames = [
            'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
            'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
        ];
        const dataMap = new Map<number, number>();
        monthlyTestCounts.forEach(item => {
            dataMap.set(item.month, item.count);
        });

        const chartPoints = [];
        const today = new Date();
        const currentMonth = today.getMonth() + 1; // Bulan saat ini (1-12)
        const currentFullYear = today.getFullYear();

        // Selalu tampilkan 12 bulan untuk label X-axis, tetapi nilai untuk bulan mendatang di tahun berjalan adalah 0
        for (let i = 1; i <= 12; i++) {
            let value = dataMap.get(i) || 0;
            // Jika tahun yang dipilih adalah tahun saat ini, dan bulan ini belum tiba, set nilai ke 0
            if (currentYear === currentFullYear && i > currentMonth) {
                value = 0;
            }
            chartPoints.push({
                month: monthNames[i - 1],
                value: value,
            });
        }
        return chartPoints;
    }, [monthlyTestCounts, currentYear]);


    // Menentukan nilai maksimum untuk skala Y-axis yang lebih efektif
    const maxValue = useMemo(() => {
        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentFullYear = today.getFullYear();

        const relevantDataForMax = processedChartData.filter((_, index) => {
            return !(currentYear === currentFullYear && (index + 1) > currentMonth);
        });

        const max = Math.max(...relevantDataForMax.map(d => d.value));

        let calculatedMax = Math.max(5, max); // Pastikan minimal 5 untuk skala yang terlihat

        if (max > 0) {
            // Bulatkan ke atas ke kelipatan 5 atau 10 untuk skala yang lebih rapi
            if (max <= 5) calculatedMax = 5;
            else if (max <= 10) calculatedMax = 10;
            else {
                calculatedMax = Math.ceil(max / 5) * 5; // Bulatkan ke kelipatan 5 terdekat
            }
            // Tambahkan sedikit padding di atas
            const padding = Math.ceil(calculatedMax * 0.1); // Tambah 10% dari max value untuk padding
            calculatedMax += Math.max(1, padding); // Pastikan minimal padding adalah 1 jika max > 0
        }

        return calculatedMax;
    }, [processedChartData, currentYear]);

    // Data points yang akan digunakan untuk menggambar polyline dan circles
    const dataPointsToDraw = useMemo(() => {
        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentFullYear = today.getFullYear();

        if (currentYear === currentFullYear) {
            // Jika tahun saat ini, hanya ambil data hingga bulan saat ini
            return processedChartData.slice(0, currentMonth);
        } else {
            // Untuk tahun-tahun sebelumnya, ambil semua 12 bulan
            return processedChartData;
        }
    }, [processedChartData, currentYear]);

    // Menghitung label Y-axis yang lebih mudah dibaca
    const yAxisLabels = useMemo(() => {
        const labels = [];
        const numSteps = 5; // Jumlah langkah/label yang diinginkan (termasuk 0 dan maxValue)
        // Hitung nilai per langkah, pastikan tidak ada pembagian dengan nol
        const stepValue = maxValue > 0 ? Math.ceil(maxValue / (numSteps - 1)) : 1;

        for (let i = 0; i < numSteps; i++) {
            labels.push(i * stepValue);
        }
        // Pastikan nilai maxValue terakhir juga termasuk jika tidak pas kelipatan
        if (labels[labels.length - 1] < maxValue) {
            labels[labels.length - 1] = maxValue;
        }
        return labels;
    }, [maxValue]);


    return (
        <>
            <Head title="Dashboard Admin" />

            {/* Bungkus konten dashboard dengan AdminLayout */}
            <AdminLayout auth={auth} pageTitle="Dashboard">
                {/* Statistik Kartu */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                    {/* Total Participant Card */}
                    <div className="bg-white dark:bg-[#1e1e1e] border border-gray-100 dark:border-gray-700 rounded-lg shadow-md p-4 flex items-center gap-4">
                        <div className="p-3 rounded-full bg-[#DBA552] text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Total Participant</p>
                            <p className="text-3xl font-bold text-[#1b1b18] dark:text-white">{stats.totalParticipants}</p>
                        </div>
                    </div>

                    {/* Not Started Card */}
                    <div className="bg-white dark:bg-[#1e1e1e] border border-gray-100 dark:border-gray-700 rounded-lg shadow-md p-4 flex items-center gap-4">
                        <div className="p-3 rounded-full bg-[#DBA552] text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Not Started</p>
                            <p className="text-3xl font-bold text-[#1b1b18] dark:text-white">{stats.notStartedTests}</p>
                        </div>
                    </div>


                    {/* On Test Card */}
                    <div className="bg-white dark:bg-[#1e1e1e] border border-gray-100 dark:border-gray-700 rounded-lg shadow-md p-4 flex items-center gap-4">
                        <div className="p-3 rounded-full bg-[#DBA552] text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">On Test</p>
                            <p className="text-3xl font-bold text-[#1b1b18] dark:text-white">{stats.activeTests}</p>
                        </div>
                    </div>

                    {/* Total Token Card */}
                    <div className="bg-white dark:bg-[#1e1e1e] border border-gray-100 dark:border-gray-700 rounded-lg shadow-md p-4 flex items-center gap-4">
                        <div className="p-3 rounded-full bg-[#DBA552] text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 8h14"></path>
                                <path d="M5 12h14"></path>
                                <path d="M5 16h14"></path>
                                <circle cx="7" cy="8" r="2"></circle>
                                <circle cx="12" cy="12" r="2"></circle>
                                <circle cx="17" cy="16" r="2"></circle>
                            </svg>
                        </div>
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Total Tokens</p>
                            <p className="text-3xl font-bold text-[#1b1b18] dark:text-white">{stats.totalTokens}</p>
                        </div>
                    </div>
                </div>

                {/* Latest Participant & User Test Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-3">
                    {/* User Test Chart Card */}
                    <div className="bg-white dark:bg-[#1e1e1e] rounded-lg shadow-md p-6 col-span-4 border border-gray-120 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-[#1b1b18] dark:text-white">User Test Activity</h2>
                            {/* Dropdown untuk memilih tahun */}
                            <select
                                value={currentYear}
                                onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                                className="rounded-md border-gray-300 dark:bg-[#2a2a2a] dark:border-gray-700 dark:text-white text-sm p-2"
                            >
                                {availableYears.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                        <div className="relative h-full">
                            <svg className="w-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                                {/* Garis Y-axis */}
                                {yAxisLabels.map((labelValue, i) => (
                                    <line
                                        key={`y-line-${i}`}
                                        x1="30"
                                        y1={180 - (labelValue / maxValue) * 150}
                                        x2="390"
                                        y2={180 - (labelValue / maxValue) * 150}
                                        stroke="#e0e0e0"
                                        strokeDasharray="2,2"
                                    />
                                ))}
                                {/* Label Y-axis */}
                                {yAxisLabels.map((labelValue, i) => (
                                    <text
                                        key={`y-label-${i}`}
                                        x="20"
                                        y={182 - (labelValue / maxValue) * 150}
                                        fontSize="7"
                                        fill="#666"
                                        textAnchor="end"
                                    >
                                        {labelValue}
                                    </text>
                                ))}

                                {/* Path untuk grafik garis */}
                                <polyline
                                    fill="none"
                                    stroke="#DBA552"
                                    strokeWidth="1"
                                    points={dataPointsToDraw.map((d, i) => {
                                        // Lebar X-axis disesuaikan dengan jumlah total bulan (12)
                                        const totalMonthsForXAxis = 12;
                                        // Pastikan pembagian tidak dengan nol jika hanya ada 1 bulan data
                                        const x = 30 + (i * (360 / (totalMonthsForXAxis > 1 ? totalMonthsForXAxis - 1 : 1)));
                                        const y = 180 - (d.value * (150 / maxValue));
                                        return `${x},${y}`;
                                    }).join(' ')}
                                />
                                {/* Lingkaran di setiap titik data */}
                                {dataPointsToDraw.map((d, i) => {
                                    // Lebar X-axis disesuaikan dengan jumlah total bulan (12)
                                    const totalMonthsForXAxis = 12;
                                    const x = 30 + (i * (360 / (totalMonthsForXAxis > 1 ? totalMonthsForXAxis - 1 : 1)));
                                    const y = 180 - (d.value * (150 / maxValue));
                                    return (
                                        <circle key={`circle-${i}`} cx={x} cy={y} r="3" fill="#DBA552" stroke="#fff" strokeWidth="1" />
                                    );
                                })}
                                {/* Label X-axis (selalu 12 bulan) */}
                                {processedChartData.map((d, i) => {
                                    const totalMonthsDisplayed = processedChartData.length; // Akan selalu 12
                                    const x = 30 + (i * (360 / (totalMonthsDisplayed > 1 ? totalMonthsDisplayed - 1 : 1)));
                                    return (
                                        <text key={`x-label-${i}`} x={x} y="195" fontSize="7" fill="#666" textAnchor="middle">
                                            {d.month}
                                        </text>
                                    );
                                })}
                            </svg>
                        </div>
                    </div>

                    {/* Latest Participant Card */}
                    <div className="bg-white dark:bg-[#1e1e1e] rounded-lg shadow-md p-6 col-span-4 lg:col-span-2 border border-gray-120 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-[#1b1b18] dark:text-white">Latest Participant</h2>
                        </div>
                        <div className="space-y-4">
                            {latestParticipants.length === 0 ? (
                                <p className="text-gray-600 dark:text-gray-400 text-center py-4">Belum ada peserta terbaru.</p>
                            ) : (
                                latestParticipants.map((participant) => (
                                    <div key={participant.id} className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3 last:border-b-0">
                                        <div>
                                            <p className="font-medium text-[#1b1b18] dark:text-white">{participant.name}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{participant.age} yrs, {participant.position}</p>
                                        </div>
                                        {participant.status === 'completed' && (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                        {participant.status === 'in_progress' && (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356-2A8.001 8.001 0 004 12c0 2.21.894 4.202 2.342 5.658M18 10v5h.582m-15.356 2A8.001 8.001 0 0020 12c0-2.21-.894-4.202-2.342-5.658" />
                                            </svg>
                                        )}
                                        {participant.status === 'incomplete' && (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        )}
                                        {participant.status === 'not_started' && (
                                            <p className="font-body text-gray-600 dark:text-gray-400">Belum Dimulai</p>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                        <Link
                            href={route('admin.participants.index')}
                            className="mt-6 w-full inline-flex items-center justify-center rounded-md px-5 py-2 text-sm font-medium text-white bg-[#DBA552] hover:bg-[#BC8024] transition-colors duration-200 flex-shrink-0"
                        >
                            Selengkapnya
                        </Link>
                    </div>
                </div>
            </AdminLayout>
        </>
    );
}