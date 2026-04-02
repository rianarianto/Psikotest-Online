<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Participant;
use App\Models\KraepelinAnswer;
use Illuminate\Support\Facades\Log;
use App\Models\Token;

class ParticipantController extends Controller
{
    /**
     * Menampilkan daftar peserta.
     * Menyediakan data yang relevan untuk tabel admin.
     */
    public function index()
    {
        try {
            // Ambil semua peserta dengan relasi yang diperlukan
            $participants = Participant::with(['token', 'participantTests'])
                ->with(['token', 'participantTests'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($participant) {
                    // Tentukan token type untuk menampilkan label yang sesuai
                    $tokenType = $participant->token ? $participant->token->test_type : '-';

                    // Determine overall status
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
                        'email' => $participant->email,
                        'age' => $participant->age,
                        'position' => $participant->position,
                        'institution' => $participant->institution,
                        'token_id' => $participant->token_id,
                        // Derive status dari participantTests
                        'papi_test_status' => $status,
                        // Waktu mulai (dari participant_tests)
                        'papi_test_started_at' => $participant->participantTests->min('started_at')
                            ? $participant->participantTests->min('started_at')->toIso8601String()
                            : null,
                        // Waktu selesai (dari participant_tests)
                        'test_completed_at' => $participant->participantTests->max('completed_at')
                            ? $participant->participantTests->max('completed_at')->toIso8601String()
                            : null,
                        'created_at' => $participant->created_at->toIso8601String(),
                        'token_type' => $tokenType,
                    ];
                });

            return Inertia::render('Psikotest/Admin/ParticipantManagement', [
                'participants' => $participants,
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching participants data: ' . $e->getMessage() . ' in ' . $e->getFile() . ' on line ' . $e->getLine());
            return redirect()->back()->withErrors(['error' => 'Gagal memuat data peserta. Silakan coba lagi.']);
        }
    }
}
