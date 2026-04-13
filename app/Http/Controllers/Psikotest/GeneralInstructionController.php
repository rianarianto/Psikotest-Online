<?php

namespace App\Http\Controllers\Psikotest;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Participant;
use App\Models\Token;
use App\Models\TestType;
use App\Models\ParticipantTest;
use Illuminate\Support\Facades\Log;

class GeneralInstructionController extends Controller
{
    /**
     * Menampilkan halaman General Instructions (Hub utama)
     */
    public function show(Request $request)
    {
        $participantId = $request->session()->get('participant_id');
        $tokenId = $request->session()->get('token_id');

        if (!$participantId || !$tokenId) {
            Log::warning('GeneralInstructionController@show: Session data missing');
            return redirect()->route('home')->withErrors([
                'session' => 'Sesi tidak valid. Silakan mulai kembali.'
            ]);
        }

        $participant = Participant::with('participantTests.testType')->find($participantId);
        $token = Token::find($tokenId);

        if (!$participant || !$token) {
            Log::error('GeneralInstructionController@show: Participant or Token not found');
            return redirect()->route('home')->withErrors([
                'error' => 'Data tidak ditemukan.'
            ]);
        }

        // Check if token is expired
        if ($token->isExpired()) {
            $request->session()->forget(['participant_id', 'token_id', 'test_type']);
            return redirect()->route('home')->withErrors([
                'token' => 'Token sudah kadaluarsa. Silakan hubungi administrator.'
            ]);
        }

        // Get assigned tests from token
        $assignedTestCodes = $token->getAssignedTestCodes();

        // Get test types that are assigned
        $assignedTests = TestType::whereIn('code', $assignedTestCodes)
            ->active()
            ->ordered()
            ->get();

        // Ensure ParticipantTest records exist for each assigned test
        foreach ($assignedTests as $testType) {
            ParticipantTest::firstOrCreate([
                'participant_id' => $participant->id,
                'test_type_id' => $testType->id,
            ], [
                'status' => ParticipantTest::STATUS_NOT_STARTED,
            ]);
        }

        // Reload participant tests
        $participant->load('participantTests.testType');

        // Build test list with status
        $testList = $assignedTests->map(function ($testType) use ($participant) {
            $participantTest = $participant->participantTests
                ->where('test_type_id', $testType->id)
                ->first();

            return [
                'id' => $testType->id,
                'code' => $testType->code,
                'name' => $testType->name,
                'description' => $testType->description,
                'duration_minutes' => $testType->duration_minutes,
                'instruction_route' => $testType->instruction_route,
                'test_route' => $testType->test_route,
                'icon' => $testType->icon,
                'status' => $participantTest ? $participantTest->status : 'not_started',
                'started_at' => $participantTest?->started_at?->toIso8601String(),
                'completed_at' => $participantTest?->completed_at?->toIso8601String(),
            ];
        });

        // Check if all tests are completed
        $allCompleted = $testList->every(fn($test) => $test['status'] === 'completed');

        return Inertia::render('Psikotest/GeneralInstructions', [
            'participant' => [
                'id' => $participant->id,
                'name' => $participant->name,
                'email' => $participant->email,
                'age' => $participant->age,
                'position' => $participant->position,
                'institution' => $participant->institution,
            ],
            'token' => [
                'expires_at' => $token->expires_at?->toIso8601String(),
                'remaining_seconds' => $token->getRemainingTimeSeconds(),
            ],
            'tests' => $testList,
            'allCompleted' => $allCompleted,
        ]);
    }

    /**
     * Submit semua tes dan selesaikan sesi
     */
    public function submitAll(Request $request)
    {
        $participantId = $request->session()->get('participant_id');
        $tokenId = $request->session()->get('token_id');

        if (!$participantId || !$tokenId) {
            return redirect()->route('home')->withErrors([
                'session' => 'Sesi tidak valid.'
            ]);
        }

        $participant = Participant::find($participantId);
        $token = Token::find($tokenId);

        if (!$participant || !$token) {
            return redirect()->route('home')->withErrors([
                'error' => 'Data tidak ditemukan.'
            ]);
        }

        // Verify all tests are completed
        if (!$participant->allTestsCompleted()) {
            $participant->load('participantTests.testType');
            Log::warning('GeneralInstructionController@submitAll: Completion check failed', [
                'participant_id' => $participant->id,
                'token_id' => $token->id,
                'assigned_test_codes' => $token->getAssignedTestCodes(),
                'test_statuses' => $participant->participantTests->map(fn($t) => [($t->testType->code ?? 'unknown') => $t->status]),
            ]);
            
            return back()->withErrors([
                'error' => 'Semua tes harus diselesaikan terlebih dahulu.'
            ]);
        }

        // Update participant completion time
        $participant->update([
            'test_completed_at' => now(),
        ]);

        // Update token status
        $token->update([
            'status' => 'used',
            'used_at' => now(),
        ]);

        // Clear session dihapus dari sini agar halaman finish-test masih bisa mengakses data participant
        // Sesi akan dibersihkan oleh middleware saat user meninggalkan halaman finish-test
        // $request->session()->forget(['participant_id', 'token_id', 'test_type']);

        Log::info('GeneralInstructionController@submitAll: All tests submitted for participant ' . $participantId);

        return back();
    }
}
