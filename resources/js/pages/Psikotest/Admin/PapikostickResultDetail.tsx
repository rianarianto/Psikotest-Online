import React, { useState, useMemo, useRef } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import type { SharedData } from '@/types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

interface ParticipantDetailData {
    id: number;
    name: string;
    email: string;
    age: number | null;
    position: string | null;
    institution: string | null;
    papi_test_status: string;
    papi_test_started_at: string | null;
    test_completed_at: string | null;
    token_type: string | null;
}

interface TraitScores {
    [key: string]: number;
}

interface TraitDetails {
    [key: string]: {
        name: string;
        description: string;
    };
}

interface AnswerData {
    question_id: number;
    chosen_option: 'A' | 'B';
    statement_a: string;
    statement_b: string;
    choice_a_trait: string | null;
    choice_b_trait: string | null;
}

interface KraepelinChartData {
    minute: number; // Represents 'Session'
    total_answered: number;
    correct_count: number;
    incorrect_count: number; // Added
    answer_pattern?: boolean[]; // Added for detailed stacked bar
}

interface KraepelinData {
    chartData: KraepelinChartData[];
    totalCorrect: number;
    hasData: boolean;
}

interface ResultDetailProps extends SharedData {
    participant: ParticipantDetailData;
    traitScores: TraitScores;
    traitsDetails: TraitDetails;
    answers: AnswerData[];
    kraepelinData?: KraepelinData;
}

export default function PapikostickResultDetail() {
    const { participant, traitScores, traitsDetails, answers, kraepelinData, auth } = usePage<ResultDetailProps>().props;
    const chartRef = useRef<HTMLDivElement>(null);

    // Determine initial active tab based on token_type and available data
    const initialTab = useMemo(() => {
        if (participant.token_type === 'kraepelin') return 'kraepelin';
        if (participant.token_type === 'papi') return 'papi';
        if (traitScores && Object.keys(traitScores).length > 0) return 'papi';
        if (kraepelinData?.hasData) return 'kraepelin';
        return 'papi';
    }, [participant.token_type, kraepelinData, traitScores]);

    const [activeTab, setActiveTab] = useState<'papi' | 'kraepelin'>(initialTab);
    const [isExporting, setIsExporting] = useState(false);

    // Helper functions for PDF Export
    const formatTraitScoresForPdf = () => {
        return Object.entries(traitScores || {})
            .sort(([codeA], [codeB]) => codeA.localeCompare(codeB))
            .map(([traitCode, score]) => [
                traitCode,
                traitsDetails[traitCode]?.name || 'N/A',
                score.toString(),
                traitsDetails[traitCode]?.description || 'Deskripsi tidak tersedia.',
            ]);
    };

    const formatKraepelinForPdf = () => {
        return kraepelinData?.chartData.map(d => [
            d.minute.toString(),
            d.total_answered.toString(),
            d.correct_count.toString(),
            d.incorrect_count.toString(), // Added
            d.total_answered > 0 ? Math.round((d.correct_count / d.total_answered) * 100) + '%' : '0%'
        ]) || [];
    };

    const formatSingleAnswerToColumns = (answer: AnswerData | undefined) => {
        if (!answer) {
            return ['', '', '', '', ''];
        }

        let statementText = '';
        let traitCode = '';
        let traitName = '';

        if (answer.chosen_option === 'A') {
            statementText = answer.statement_a;
            traitCode = answer.choice_a_trait || '';
        } else if (answer.chosen_option === 'B') {
            statementText = answer.statement_b;
            traitCode = answer.choice_b_trait || '';
        }

        traitName = traitsDetails[traitCode]?.name || '-';

        return [
            answer.question_id.toString(),
            answer.chosen_option,
            statementText,
            traitCode,
            traitName,
        ];
    };

    const formatAnswersForTwoColumnPdf = (answersData: AnswerData[]) => {
        const rows: (string | number)[][] = [];
        const numQuestions = answersData.length;
        const totalRows = Math.ceil(numQuestions / 2);

        for (let i = 0; i < totalRows; i++) {
            const leftAnswer = answersData[i];
            const rightAnswer = answersData[i + totalRows];

            const leftColumns = formatSingleAnswerToColumns(leftAnswer);
            const rightColumns = formatSingleAnswerToColumns(rightAnswer);

            rows.push([...leftColumns, ...rightColumns]);
        }
        return rows;
    };

    const handleExportPdf = async () => {
        try {
            console.log('Starting PDF Export...');
            const doc = new jsPDF('p', 'mm', 'a4');
            doc.setFont('helvetica');
            doc.setTextColor(30, 30, 30);

            let yPos = 20;
            const margin = 15;

            // Header Info
            doc.setFontSize(22);
            doc.setFont('helvetica', 'bold');
            doc.text(`Hasil Psikotes`, margin, yPos);
            yPos += 10;

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Nama: ${participant.name}`, margin, yPos);
            yPos += 5;
            doc.text(`Email: ${participant.email}`, margin, yPos);
            yPos += 5;
            doc.text(`Usia: ${participant.age || '-'}`, margin, yPos);
            yPos += 5;
            doc.text(`Posisi Dilamar: ${participant.position || '-'}`, margin, yPos);
            yPos += 5;
            doc.text(`Institusi: ${participant.institution || '-'}`, margin, yPos);
            yPos += 5;
            doc.text(`Waktu Mulai: ${participant.papi_test_started_at ? new Date(participant.papi_test_started_at).toLocaleString() : '-'}`, margin, yPos);
            yPos += 15;

            // PapiKostick Section
            if (participant.token_type !== 'kraepelin' && traitScores && Object.keys(traitScores).length > 0) {
                console.log('Processing Papi Section...');
                doc.setFontSize(16);
                doc.setFont('helvetica', 'bold');
                doc.text('Skor Sifat PapiKostick', margin, yPos);
                yPos += 8;

                const traitHeaders = [['Kode Sifat', 'Nama Sifat', 'Skor', 'Deskripsi']];
                const traitData = formatTraitScoresForPdf();

                autoTable(doc, {
                    startY: yPos,
                    head: traitHeaders,
                    body: traitData,
                    theme: 'grid',
                    headStyles: { fillColor: [219, 165, 82], textColor: 255, fontSize: 9, halign: 'center' },
                    styles: { fontSize: 8, cellPadding: 0.2, overflow: 'linebreak', lineColor: [200, 200, 200], lineWidth: 0.1, valign: 'top' },
                    columnStyles: { 0: { cellWidth: 20, fontStyle: 'bold', halign: 'center' }, 1: { cellWidth: 35 }, 2: { cellWidth: 15, halign: 'center' }, 3: { cellWidth: 110 } },
                    margin: { left: margin, right: margin }
                });
                yPos = (doc as any).lastAutoTable.finalY + 15;


            }

            // Kraepelin Section
            if (kraepelinData?.hasData) {
                console.log('Processing Kraepelin Section...');
                if (yPos + 40 > doc.internal.pageSize.height) {
                    doc.addPage();
                    yPos = margin;
                }

                doc.setFontSize(16);
                doc.setFont('helvetica', 'bold');
                doc.text('Hasil Kraepelin', margin, yPos);
                yPos += 8;



                // Render Graph Image using XMLSerializer (Native SVG Capture - Robust)
                if (chartRef.current) {
                    try {
                        console.log('Capturing chart using XMLSerializer...');
                        const svgElement = chartRef.current.querySelector('svg');
                        if (svgElement) {
                            const serializer = new XMLSerializer();
                            let svgString = serializer.serializeToString(svgElement);

                            // Ensure namespace for standalone validity
                            if (!svgString.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
                                svgString = svgString.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
                            }

                            const canvas = document.createElement('canvas');
                            const width = 1000;
                            const height = 500;
                            canvas.width = width;
                            canvas.height = height;
                            const ctx = canvas.getContext('2d');

                            if (ctx) {
                                await new Promise<void>((resolve, reject) => {
                                    const img = new Image();
                                    img.onload = () => {
                                        ctx.fillStyle = 'white';
                                        ctx.fillRect(0, 0, width, height);
                                        ctx.drawImage(img, 0, 0, width, height);
                                        resolve();
                                    };
                                    img.onerror = (e) => reject(e);
                                    // Use Base64 encoded SVG to bypass DOM visibility issues
                                    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
                                });

                                const imgData = canvas.toDataURL('image/png');
                                const imgProps = doc.getImageProperties(imgData);
                                const pdfWidth = doc.internal.pageSize.getWidth() - margin * 2;
                                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

                                if (yPos + pdfHeight > doc.internal.pageSize.getHeight() - margin) {
                                    doc.addPage();
                                    yPos = margin;
                                }

                                doc.addImage(imgData, 'PNG', margin, yPos, pdfWidth, pdfHeight);
                                yPos += pdfHeight + 10;
                                console.log('Chart captured successfully (SVG Serializer).');
                            }
                        } else {
                            console.warn("SVG element not found in chartRef.");
                        }
                    } catch (error) {
                        console.error("Error capturing graph:", error);
                    }
                } else {
                    console.warn("Chart Ref is null. Graph not captured.");
                }


            }

            console.log('Saving PDF...');
            doc.save(`Hasil_Psikotes_${participant.name.replace(/[^a-zA-Z0-9_]/g, '_')}.pdf`);
        } catch (err) {
            console.error('PDF Export Critical Error:', err);
            alert('Terjadi kesalahan saat mengekspor PDF. Silakan cek console browser.');
        }
    };

    // Kraepelin Chart Logic - Detailed Stacked Bar
    const renderKraepelinChart = () => {
        if (!kraepelinData?.chartData || kraepelinData.chartData.length === 0) return <p>Data grafik tidak tersedia.</p>;

        const data = kraepelinData.chartData;
        const width = 1000;
        const height = 500; // Increased height for better stacking detail
        const padding = 40;

        const maxVal = Math.max(...data.map(d => d.total_answered), 10);
        const gridMax = Math.ceil(maxVal / 5) * 5; // Round up to nearest 5

        const xScale = (width - padding * 2) / data.length;
        const yScale = (height - padding * 2) / gridMax;

        const barWidth = xScale * 0.75; // 75% width of the slot

        return (
            <div className="w-full overflow-x-auto" ref={chartRef}>
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[800px]" style={{ backgroundColor: 'white' }}>
                    {/* Grid Lines Y */}
                    {[0, 0.2, 0.4, 0.6, 0.8, 1].map(fraction => {
                        const val = Math.round(gridMax * fraction);
                        const y = height - padding - (val * yScale);
                        return (
                            <g key={fraction}>
                                <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#e5e7eb" strokeDasharray="4" />
                                <text x={padding - 10} y={y + 4} textAnchor="end" fontSize="10" fill="#6b7280">{val}</text>
                            </g>
                        );
                    })}

                    {/* Bars */}
                    {data.map((d, i) => {
                        const x = padding + i * xScale + (xScale - barWidth) / 2;
                        return (
                            <g key={i}>
                                {/* X Label */}
                                {(i === 0 || i === data.length - 1 || (d.minute % 5 === 0)) && (
                                    <text x={padding + i * xScale + xScale / 2} y={height - padding + 20} textAnchor="middle" fontSize="10" fill="#6b7280">
                                        {d.minute}
                                    </text>
                                )}

                                {/* Stacked Rects (Answer Pattern) */}
                                {d.answer_pattern?.map((isCorrect, idx) => {
                                    const y = height - padding - ((idx + 1) * yScale); // Stack Upwards
                                    return (
                                        <rect
                                            key={`${i}-${idx}`}
                                            x={x}
                                            y={y}
                                            width={barWidth}
                                            height={yScale - 1} // -1 gap for separation
                                            fill={isCorrect ? "#DBA552" : "#ef4444"}
                                            opacity={0.9}
                                        />
                                    );
                                })}

                                {/* Fallback if no pattern (should not happen with new backend) */}
                                {!d.answer_pattern && (
                                    <rect
                                        x={x}
                                        y={height - padding - (d.total_answered * yScale)}
                                        width={barWidth}
                                        height={d.total_answered * yScale}
                                        fill="#DBA552"
                                    />
                                )}
                            </g>
                        );
                    })}

                    {/* Legend */}
                    <g transform={`translate(${width - 250}, 20)`}>
                        <rect x="0" y="-4" width="10" height="10" fill="#DBA552" rx="2" />
                        <text x="15" y="4" fontSize="10" fill="#374151">Benar</text>

                        <rect x="65" y="-4" width="10" height="10" fill="#ef4444" rx="2" />
                        <text x="80" y="4" fontSize="10" fill="#374151">Salah</text>

                        <text x="0" y="20" fontSize="10" fill="#6b7280" fontStyle="italic">Setiap kotak mewakili satu jawaban.</text>
                    </g>
                </svg>
            </div>
        );
    };

    return (
        <AdminLayout auth={auth} pageTitle={`Hasil Tes: ${participant.name}`}>
            <Head title={`Hasil Tes: ${participant.name}`} />
            <div className="mb-6 flex justify-between items-center">
                <Link
                    href={route('admin.participants.index')}
                    className="inline-flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 border border-transparent rounded-md font-semibold text-xs text-gray-800 dark:text-gray-200 uppercase tracking-widest hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                    &larr; Kembali
                </Link>
                <button
                    onClick={handleExportPdf}
                    className="inline-flex items-center px-4 py-2 bg-[#DBA552] border border-transparent rounded-md font-semibold text-xs text-white uppercase hover:bg-[#BC8024] transition"
                >
                    Ekspor ke PDF
                </button>
            </div>

            {/* Info Peserta */}
            <div className="bg-white dark:bg-[#1e1e1e] rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold text-[#1b1b18] dark:text-white mb-4">Informasi Peserta</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
                    <div>
                        <p className="mb-2"><span className="font-semibold">Nama:</span> {participant.name}</p>
                        <p className="mb-2"><span className="font-semibold">Email:</span> {participant.email}</p>
                        <p className="mb-2"><span className="font-semibold">Usia:</span> {participant.age || '-'}</p>
                    </div>
                    <div>
                        <p className="mb-2"><span className="font-semibold">Posisi:</span> {participant.position || '-'}</p>
                        <p className="mb-2"><span className="font-semibold">Institusi:</span> {participant.institution || '-'}</p>
                        <p className="mb-2"><span className="font-semibold">Jenis Tes:</span> {participant.token_type || '-'}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {participant.token_type !== 'kraepelin' && (
                        <button
                            onClick={() => setActiveTab('papi')}
                            className={`${activeTab === 'papi'
                                ? 'border-[#DBA552] text-[#DBA552]'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                        >
                            PapiKostick
                        </button>
                    )}
                    {kraepelinData?.hasData && (
                        <button
                            onClick={() => setActiveTab('kraepelin')}
                            className={`${activeTab === 'kraepelin'
                                ? 'border-[#DBA552] text-[#DBA552]'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                        >
                            Kraepelin
                        </button>
                    )}
                </nav>
            </div>

            {/* Content Papi (Hidden if inactive) */}
            <div className={activeTab === 'papi' ? 'block' : 'hidden'}>
                {participant.token_type !== 'kraepelin' && (
                    <div className="space-y-6">
                        {/* Trait Scores Table */}
                        {traitScores && Object.keys(traitScores).length > 0 ? (
                            <div className="bg-white dark:bg-[#1e1e1e] rounded-lg shadow-md p-6">
                                <h3 className="text-lg font-semibold text-[#1b1b18] dark:text-white mb-4">Skor Sifat</h3>
                                <div className="overflow-x-auto max-h-120 overflow-y-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-[#2a2a2a]">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kode</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Sifat</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Skor</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deskripsi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-[#1e1e1e] divide-y divide-gray-200 dark:divide-gray-700">
                                            {Object.entries(traitScores).sort().map(([code, score]) => (
                                                <tr key={code}>
                                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{code}</td>
                                                    <td className="px-6 text-sm py-4 text-gray-700 dark:text-gray-300">{traitsDetails[code]?.name}</td>
                                                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{score}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs">{traitsDetails[code]?.description}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            (!kraepelinData?.hasData) && (
                                <div className="bg-white dark:bg-[#1e1e1e] rounded-lg shadow-md p-6 text-center">
                                    <p className="text-gray-500">Tidak ada data Papi Kostick.</p>
                                </div>
                            )
                        )}

                        {/* Detail Jawaban Table */}
                        {answers && answers.length > 0 && (
                            <div className="bg-white dark:bg-[#1e1e1e] rounded-lg shadow-md p-6">
                                <h3 className="text-lg font-semibold text-[#1b1b18] dark:text-white mb-4">Detail Jawaban</h3>
                                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-[#2a2a2a]">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">No.</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Pilihan A</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Sifat A</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Pilihan B</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Sifat B</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Jawaban</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-[#1e1e1e] divide-y divide-gray-200 dark:divide-gray-700">
                                            {answers.map((answer) => (
                                                <tr key={answer.question_id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{answer.question_id}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 max-w-xs break-words">{answer.statement_a}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{answer.choice_a_trait || '-'}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 max-w-xs break-words">{answer.statement_b}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{answer.choice_b_trait || '-'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#DBA552]">{answer.chosen_option}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Content Kraepelin (Offscreen if inactive, Overlay if Exporting) */}
            {kraepelinData?.hasData && (
                <div className={
                    activeTab === 'kraepelin'
                        ? 'space-y-6'
                        : (isExporting
                            ? 'fixed top-0 left-0 w-full h-full z-[9999] bg-white p-10 overflow-y-auto'
                            : 'fixed top-0 left-[-10000px] w-[1000px] opacity-0 pointer-events-none'
                        )
                }>
                    <div className="bg-white dark:bg-[#1e1e1e] rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-[#1b1b18] dark:text-white mb-4">Grafik Daya Tahan (Speed/Accuracy)</h3>
                        <p className="text-sm text-gray-500 mb-6">Grafik ini menunjukkan jumlah jawaban benar per sesi tes.</p>

                        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-gray-50 dark:bg-[#2a2a2a] p-4 rounded-lg text-center border border-black/3">
                                <span className="block text-gray-500 text-xs uppercase">Total Jawaban Benar</span>
                                <span className="block text-2xl font-bold text-[#DBA552]">{kraepelinData.totalCorrect}</span>
                            </div>
                            <div className="bg-gray-50 dark:bg-[#2a2a2a] p-4 rounded-lg text-center border border-black/3">
                                <span className="block text-gray-500 text-xs uppercase">Rata-rata per Sesi</span>
                                <span className="block text-2xl font-bold text-[#DBA552]">
                                    {kraepelinData.chartData.length ? (kraepelinData.totalCorrect / kraepelinData.chartData.length).toFixed(1) : '0'}
                                </span>
                            </div>
                        </div>

                        {renderKraepelinChart()}
                    </div>
                </div>
            )}

            {/* Show message if Kraepelin tab is active but no data */}
            {activeTab === 'kraepelin' && (!kraepelinData || !kraepelinData.hasData) && (
                <div className="bg-white dark:bg-[#1e1e1e] rounded-lg shadow-md p-6 text-center">
                    <p className="text-gray-500">Tidak ada data Kraepelin untuk peserta ini.</p>
                </div>
            )}
        </AdminLayout>
    );
}
