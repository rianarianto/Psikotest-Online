<?php

namespace App\Http\Controllers\Psikotest;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Token;
use App\Models\Participant;
use App\Models\ParticipantTest;
use App\Models\TestType;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class TokenController extends Controller
{
    // Konstanta durasi tes Kraepelin (harus sama dengan KraepelinTestController)
    const KRAEPELIN_TOTAL_SESSIONS = 50;
    const KRAEPELIN_SECONDS_PER_SESSION = 15;

    public function verify(Request $request)
    {
        $request->validate([
            'token' => 'required|string'
        ]);

        $token = Token::where('token', $request->token)->first();

        // Jika token tidak ditemukan sama sekali
        if (!$token) {
            throw ValidationException::withMessages([
                'token' => 'Token tidak valid. Pastikan token yang Anda masukkan benar.',
            ]);
        }

        // Logika pengalihan berdasarkan status token
        switch ($token->status) {
            case 'unused':
                $token->update(['status' => 'in_progress']);
                session(['token_id' => $token->id, 'test_type' => $token->test_type]);
                
                // Set persistent cookie for recovery (lifetime: 2 hours or until token expires)
                $cookieLifetime = $token->expires_at ? now()->diffInMinutes($token->expires_at) : 120;
                cookie()->queue('psikotest_token', $token->token, $cookieLifetime);

                return redirect()->route('psikotest.biodata');

            case 'in_progress':
                // Jika belum ada peserta yang terdaftar -> ke halaman biodata
                if (!$token->used_by) {
                    session(['token_id' => $token->id, 'test_type' => $token->test_type]);
                    return redirect()->route('psikotest.biodata');
                }

                $participant = Participant::find($token->used_by);

                if (!$participant) {
                    $token->update(['status' => 'unused', 'used_by' => null, 'used_at' => null]);
                    session()->forget(['token_id', 'test_type', 'participant_id']);
                    throw ValidationException::withMessages(['token' => 'Data peserta tidak ditemukan.']);
                }

                session([
                    'token_id' => $token->id,
                    'test_type' => $token->test_type,
                    'participant_id' => $participant->id,
                ]);

                // Ensure persistent cookie is set/refreshed
                $cookieLifetime = $token->expires_at ? now()->diffInMinutes($token->expires_at) : 120;
                cookie()->queue('psikotest_token', $token->token, $cookieLifetime);

                // === AUTO-COMPLETE EXPIRED TESTS ===
                // Cek dan mark-complete tes yang waktunya sudah habis (tanpa user klik submit)
                $this->autoCompleteExpiredTests($participant);

                // Setelah auto-complete, cek ulang apakah semua tes selesai
                if ($participant->allTestsCompleted()) {
                    // Semua tes selesai, update token status jadi 'used'
                    $token->update(['status' => 'used']);
                    return redirect()->route('psikotest.finish-test');
                }

                // Cek apakah ada tes yang sedang in_progress
                $testInProgress = $participant->getTestInProgress();

                if ($testInProgress) {
                    // Ada tes yang sedang dikerjakan, langsung arahkan ke tes tersebut
                    $testCode = $testInProgress->testType->code ?? null;

                    if ($testCode === 'papi') {
                        return redirect()->route('psikotest.papi-test');
                    } elseif ($testCode === 'kraepelin') {
                        return redirect()->route('psikotest.kraepelin-test');
                    }
                }

                // Ada tes yang belum dimulai/selesai, ke halaman General Instructions
                return redirect()->route('psikotest.general-instructions');

            case 'used':
                session()->forget(['token_id', 'test_type', 'participant_id']);
                throw ValidationException::withMessages(['token' => 'Token ini sudah digunakan.']);

            default:
                session()->forget(['token_id', 'test_type', 'participant_id']);
                throw ValidationException::withMessages(['token' => 'Status token tidak valid.']);
        }
    }

    /**
     * Auto-complete tes yang waktunya sudah habis
     * Dipanggil saat user kembali dengan token setelah meninggalkan tes
     */
    private function autoCompleteExpiredTests(Participant $participant): void
    {
        // Cek Kraepelin test
        $kraepelinType = TestType::where('code', 'kraepelin')->first();
        if ($kraepelinType) {
            $kraepelinTest = ParticipantTest::where('participant_id', $participant->id)
                ->where('test_type_id', $kraepelinType->id)
                ->first();

            if ($kraepelinTest && $kraepelinTest->isInProgress() && $kraepelinTest->started_at) {
                // Hitung waktu yang telah berlalu
                $elapsedSeconds = now()->timestamp - $kraepelinTest->started_at->timestamp;
                $totalTestDuration = self::KRAEPELIN_TOTAL_SESSIONS * self::KRAEPELIN_SECONDS_PER_SESSION;

                // Jika waktu sudah melebihi durasi total tes, mark as completed
                if ($elapsedSeconds >= $totalTestDuration) {
                    $kraepelinTest->markAsCompleted();
                }
            }
        }

        // PAPI test tidak perlu auto-complete karena tidak ada time limit
        // Jika nanti ada tes lain dengan time limit, tambahkan logic di sini
    }
    /**
     * Clear the test session and cookies.
     */
    public function logout(Request $request)
    {
        session()->forget(['token_id', 'participant_id', 'test_type']);
        cookie()->queue(cookie()->forget('psikotest_token'));
        
        return redirect()->route('home');
    }
}