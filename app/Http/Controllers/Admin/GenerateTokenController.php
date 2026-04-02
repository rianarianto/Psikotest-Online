<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Token;
use App\Models\Participant;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;

class GenerateTokenController extends Controller
{
    /**
     * Menampilkan daftar token dan form untuk membuat token baru.
     */
    public function index()
    {
        // Ambil semua token dengan relasi participant dan participant_tests
        $tokens = Token::orderBy('created_at', 'desc')
            ->with(['participant.participantTests.testType'])
            ->get()
            ->map(function ($token) {
                // Hitung status tes yang sebenarnya dari participant_tests
                $testStatus = 'not_started';
                $completedTests = 0;
                $totalTests = 0;

                if ($token->participant) {
                    $participant = $token->participant;
                    $participantTests = $participant->participantTests;

                    if ($participantTests->isNotEmpty()) {
                        $totalTests = $participantTests->count();
                        $completedTests = $participantTests->where('status', 'completed')->count();
                        $inProgressTests = $participantTests->where('status', 'in_progress')->count();

                        if ($completedTests === $totalTests && $totalTests > 0) {
                            $testStatus = 'completed';
                        } elseif ($token->isExpired()) {
                            $testStatus = 'incomplete';
                        } elseif ($inProgressTests > 0 || $completedTests > 0) {
                            $testStatus = 'in_progress';
                        }
                    }
                }

                return [
                    'id' => $token->id,
                    'token' => $token->token,
                    'test_type' => $token->test_type,
                    'status' => $token->isExpired() ? 'expired' : $token->status, // Token status with expired check
                    'test_status' => $testStatus, // Actual test completion status
                    'completed_tests' => $completedTests,
                    'total_tests' => $totalTests,
                    'used_by_participant_id' => $token->used_by,
                    'used_by_participant_name' => $token->participant ? $token->participant->name : null,
                    'used_by_participant_email' => $token->participant ? $token->participant->email : null,
                    'intended_for_name' => $token->intended_for_name ?? null,
                    'intended_for_email' => $token->intended_for_email ?? null,
                    'used_at' => $token->used_at ? $token->used_at->setTimezone('Asia/Jakarta')->format('Y-m-d H:i') : null,
                    'created_at' => $token->created_at->setTimezone('Asia/Jakarta')->format('Y-m-d H:i'),
                    'expires_at' => $token->expires_at ? $token->expires_at->setTimezone('Asia/Jakarta')->format('Y-m-d H:i') : null,
                ];
            });

        // Hitung statistik token
        $totalTokens = Token::count();
        $unusedTokens = Token::where('status', 'unused')->where(function ($q) {
            $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
        })->count();
        $inProgressTokens = Token::where('status', 'in_progress')->where(function ($q) {
            $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
        })->count();
        $usedTokens = Token::where('status', 'used')->count();
        $expiredTokens = Token::whereNotNull('expires_at')->where('expires_at', '<', now())->where('status', '!=', 'used')->count();

        return Inertia::render('Psikotest/Admin/TokenManagement', [
            'tokens' => $tokens,
            'totalTokens' => $totalTokens,
            'unusedTokens' => $unusedTokens,
            'inProgressTokens' => $inProgressTokens,
            'usedTokens' => $usedTokens,
            'expiredTokens' => $expiredTokens,
        ]);
    }

    /**
     * Menyimpan token baru yang dibuat oleh admin.
     */
    public function store(Request $request)
    {
        $request->validate([
            'test_type' => ['required', 'array', 'min:1'],
            'test_type.*' => [Rule::in(['papi', 'kraepelin'])],
            'quantity' => ['required', 'integer', 'min:1', 'max:100'],
            'intended_for_name' => ['nullable', 'string', 'max:255'],
            'intended_for_email' => ['nullable', 'string', 'email', 'max:255'],
            'expires_at' => ['required', 'date', 'after:now'],
        ]);

        // Mengubah array ['papi', 'kraepelin'] menjadi string "papi,kraepelin"
        $testTypeArray = $request->input('test_type');
        sort($testTypeArray);
        $testTypeString = implode(',', $testTypeArray);

        $quantity = $request->input('quantity');
        $intendedForName = $request->input('intended_for_name');
        $intendedForEmail = $request->input('intended_for_email');

        // Parse input time as Asia/Jakarta (user's perspective) and convert to UTC for storage
        $expiresAt = $request->input('expires_at')
            ? \Carbon\Carbon::parse($request->input('expires_at'), 'Asia/Jakarta')->setTimezone('UTC')
            : null;

        $createdTokens = [];

        for ($i = 0; $i < $quantity; $i++) {
            $tokenCode = Str::random(10);
            while (Token::where('token', $tokenCode)->exists()) {
                $tokenCode = Str::random(10);
            }

            $token = Token::create([
                'token' => $tokenCode,
                'test_type' => $testTypeString,
                'status' => 'unused',
                'intended_for_name' => $intendedForName,
                'intended_for_email' => $intendedForEmail,
                'expires_at' => $expiresAt,
            ]);
            $createdTokens[] = $token->token;
        }

        Log::info('GenerateTokenController: ' . $quantity . ' tokens generated. Expiration: ' . $expiresAt);

        return redirect()->route('admin.tokens.index')->with('success', $quantity . ' token berhasil dibuat!');
    }

    /**
     * Menghapus token.
     */
    public function destroy(Token $token)
    {
        try {
            $token->delete();
            Log::info('GenerateTokenController: Token ' . $token->token . ' deleted by admin.');
            return redirect()->route('admin.tokens.index')->with('success', 'Token berhasil dihapus.');
        } catch (\Exception $e) {
            Log::error('GenerateTokenController: Error deleting token ' . $token->id . ': ' . $e->getMessage());
            return redirect()->route('admin.tokens.index')->with('error', 'Gagal menghapus token: ' . $e->getMessage());
        }
    }
}
