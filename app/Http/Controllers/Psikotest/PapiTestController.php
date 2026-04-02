<?php

namespace App\Http\Controllers\Psikotest;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Participant;
use App\Models\PapiQuestion;
use App\Models\PapiAnswer;
use App\Models\Token;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class PapiTestController extends Controller
{
    /**
     * Menampilkan halaman tes PapiKostick dengan pertanyaan dan melanjutkan dari jawaban terakhir.
     */
    public function show(Request $request)
    {
        $participantId = $request->session()->get('participant_id');
        $sessionTestType = $request->session()->get('test_type');

        // Validasi: harus ada participant_id dan test_type harus valid (papi atau alltest)
        // Gunakan str_contains untuk mendukung format CSV "kraepelin,papi"
        if (!$participantId || !$sessionTestType || (!str_contains($sessionTestType, 'papi') && $sessionTestType !== 'alltest')) {
            Log::error('PapiTestController@show: Invalid session or testType. Participant ID: ' . $participantId . ', Test Type: ' . $sessionTestType);
            return redirect()->route('home')->withErrors([
                'session' => 'Sesi tes tidak ditemukan atau jenis tes tidak valid. Silakan mulai kembali dari awal.'
            ]);
        }

        $participant = Participant::find($participantId);

        if (!$participant) {
            Log::error('PapiTestController@show: Participant not found for ID: ' . $participantId);
            return redirect()->route('home')->withErrors([
                'error' => 'Data peserta tidak ditemukan.'
            ]);
        }

        // Batas waktu tes PapiKostick
        $papiTimeLimitInMinutes = 90;

        // Get or create participant test record using the new modular approach
        $testType = \App\Models\TestType::where('code', 'papi')->first();
        if (!$testType) {
            return redirect()->route('psikotest.general-instructions')->withErrors([
                'error' => 'Jenis tes tidak ditemukan.'
            ]);
        }

        $participantTest = \App\Models\ParticipantTest::firstOrCreate([
            'participant_id' => $participant->id,
            'test_type_id' => $testType->id,
        ]);

        // If test is already completed, redirect to general instructions
        if ($participantTest->isCompleted()) {
            return redirect()->route('psikotest.general-instructions')
                ->with('info', 'Tes PapiKostick sudah selesai.');
        }

        // Mark as started if not yet
        if ($participantTest->status === \App\Models\ParticipantTest::STATUS_NOT_STARTED) {
            $participantTest->markAsStarted();
        }

        $questions = PapiQuestion::orderBy('id')->get()->map(function ($question) {
            return [
                'id' => $question->id,
                'statement_a' => $question->statement_a,
                'statement_b' => $question->statement_b,
            ];
        })->toArray();

        $existingAnswers = PapiAnswer::where('participant_id', $participantId)
            ->pluck('answer', 'question_id')
            ->toArray();

        $startingQuestionIndex = count($existingAnswers);

        // Jika semua pertanyaan sudah dijawab, frontend (papikostick.tsx) akan menangani 
        // tampilan tombol "Submit" akhir lewat prop startingQuestionIndex.
        // Kita tidak boleh redirect di sini karena akan menyebabkan loop "nothing happens"
        // saat user klik "Mulai Tes" di instruksi.

        // Get token for expiration info
        $tokenId = $request->session()->get('token_id');
        $token = Token::find($tokenId);

        return Inertia::render('Psikotest/Papikostic/papikostick', [
            'participant' => [
                'id' => $participant->id,
                'name' => $participant->name,
            ],
            'questions' => $questions,
            'existingAnswers' => $existingAnswers,
            'participantId' => $participant->id,
            'testType' => $testType->code,
            'startingQuestionIndex' => $startingQuestionIndex,
            'timeLimitInMinutes' => $papiTimeLimitInMinutes,
            'papiTestStartedAt' => $participantTest->started_at?->toIso8601String(),
            'tokenExpiresAt' => $token?->expires_at?->toIso8601String(),
            'tokenRemainingSeconds' => $token?->getRemainingTimeSeconds() ?? 0,
        ]);
    }

    /**
     * Menyimpan SATU jawaban tes PapiKostick secara individual (autosave).
     */
    public function saveSingleAnswer(Request $request)
    {
        $request->validate([
            'question_id' => ['required', 'integer', 'exists:papi_questions,id'],
            'answer' => ['required', 'string', 'in:A,B'],
            'participant_id' => ['required', 'integer', 'exists:participants,id'],
        ]);

        $participantId = $request->input('participant_id');
        $questionId = $request->input('question_id');
        $answer = $request->input('answer');

        DB::beginTransaction();
        try {
            Log::info('PapiTestController@saveSingleAnswer: Saving answer for participant ' . $participantId . ', question ' . $questionId . ', answer ' . $answer);
            PapiAnswer::updateOrCreate(
                [
                    'participant_id' => $participantId,
                    'question_id' => $questionId,
                ],
                [
                    'answer' => $answer,
                ]
            );
            DB::commit();
            Log::info('PapiTestController@saveSingleAnswer: Answer saved successfully.');
            return redirect()->route('psikotest.papi-test');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('PapiTestController@saveSingleAnswer: Error saving single Papi answer: ' . $e->getMessage() . ' on line ' . $e->getLine() . ' in ' . $e->getFile());
            return back()->withErrors(['error' => 'Gagal menyimpan jawaban.']);
        }
    }

    /**
     * Menandai tes PapiKostick selesai dan mengarahkan ke rute berikutnya.
     */
    public function markCompleted(Request $request)
    {
        $participantId = $request->input('participant_id') ?? $request->session()->get('participant_id');

        if (!$participantId) {
            Log::error('PapiTestController@markCompleted: Invalid session.');
            return redirect()->route('home')->withErrors(['error' => 'Sesi tes tidak valid.']);
        }

        $testType = \App\Models\TestType::where('code', 'papi')->first();

        $participantTest = \App\Models\ParticipantTest::where('participant_id', $participantId)
            ->where('test_type_id', $testType->id)
            ->first();

        if ($participantTest) {
            $participantTest->markAsCompleted();
        }

        Log::info('PapiTestController@markCompleted: Papi test completed for participant ' . $participantId);

        return redirect()->route('psikotest.general-instructions')
            ->with('success', 'Tes PapiKostick berhasil diselesaikan!');
    }
}
