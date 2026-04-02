<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Participant;
use App\Models\ParticipantTest;
use App\Models\Token;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function showSummary(Request $request)
    {
        // Ambil tahun dari request, default ke tahun saat ini
        $selectedYear = $request->input('year', Carbon::now()->year);

        // Statistik Kartu
        $totalParticipants = Participant::count();

        // Menggunakan tabel participant_tests untuk statistik tes
        $completedTests = ParticipantTest::where('status', 'completed')->count();
        $activeTests = ParticipantTest::where('status', 'in_progress')->count();
        $notStartedTests = ParticipantTest::where('status', 'not_started')->count();

        $totalTokens = Token::count();
        $totalRegisteredUsers = User::count();

        // Data untuk Chart "User Test Activity" (per bulan untuk tahun yang dipilih)
        // Menggunakan tabel participant_tests
        $monthlyTestCounts = ParticipantTest::select(
            DB::raw("MONTH(started_at) as month"),
            DB::raw('COUNT(id) as count')
        )
            ->whereNotNull('started_at')
            ->whereYear('started_at', $selectedYear)
            ->groupBy('month')
            ->orderBy('month', 'asc')
            ->get()
            ->map(function ($item) {
                return [
                    'month' => (int) $item->month,
                    'count' => (int) $item->count,
                ];
            })
            ->toArray();

        // Dapatkan daftar tahun yang tersedia dari data participant_tests
        $availableYears = ParticipantTest::select(
            DB::raw("YEAR(started_at) as year")
        )
            ->whereNotNull('started_at')
            ->distinct()
            ->orderBy('year', 'desc')
            ->pluck('year')
            ->toArray();

        // Tambahkan tahun saat ini ke daftar jika belum ada
        if (!in_array(Carbon::now()->year, $availableYears)) {
            $availableYears[] = Carbon::now()->year;
            rsort($availableYears); // Urutkan kembali secara descending
        }


        $latestParticipants = Participant::with(['token', 'participantTests'])
            ->orderBy('created_at', 'desc')
            ->limit(7)
            ->get()
            ->map(function ($participant) {
                // Determine status logic similar to ParticipantController
                $status = 'not_started';
                $hasStarted = $participant->participantTests->contains(fn($t) => $t->started_at !== null);
                $allCompleted = $participant->participantTests->every(fn($t) => $t->status === 'completed') && $participant->participantTests->isNotEmpty();

                if ($allCompleted) {
                    $status = 'completed';
                } elseif ($participant->token && $participant->token->isExpired()) {
                    $status = 'incomplete';
                } elseif ($hasStarted) {
                    $status = 'in_progress';
                }

                return [
                    'id' => $participant->id,
                    'name' => $participant->name,
                    'age' => $participant->age,
                    'position' => $participant->position,
                    'status' => $status,
                ];
            });

        return Inertia::render('Psikotest/Admin/Dashboard', [
            'stats' => [
                'totalParticipants' => $totalParticipants,
                'completedTests' => $completedTests,
                'activeTests' => $activeTests,
                'notStartedTests' => $notStartedTests,
                'totalTokens' => $totalTokens,
                'totalRegisteredUsers' => $totalRegisteredUsers,
            ],
            'latestParticipants' => $latestParticipants,
            'monthlyTestCounts' => $monthlyTestCounts,
            'availableYears' => $availableYears,
            'selectedYear' => $selectedYear,
        ]);
    }
}
