<?php

namespace App\Http\Controllers\Psikotest;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Participant;
use App\Models\Token;
use App\Models\TestType;
use App\Models\ParticipantTest;
use App\Models\KraepelinAnswer;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class KraepelinTestController extends Controller
{
    // Updated configuration per user request:
    // 40 Sessions (Rows) - Was 20
    // 100 Questions per Session (Unchanged)
    // 30 Seconds per Session (Unchanged)
    const TOTAL_MINUTES = 40; // Actually 'Sessions'
    const QUESTIONS_PER_MINUTE = 100;
    const SECONDS_PER_MINUTE = 30; // Duration of each 'Session'

    /**
     * Menampilkan halaman tes Kraepelin
     */
    public function show(Request $request)
    {
        $participantId = $request->session()->get('participant_id');
        $tokenId = $request->session()->get('token_id');

        if (!$participantId || !$tokenId) {
            return redirect()->route('home')->withErrors([
                'session' => 'Sesi tidak valid. Silakan mulai kembali.'
            ]);
        }

        $participant = Participant::find($participantId);
        $token = Token::find($tokenId);

        if (!$participant || !$token) {
            return redirect()->route('home')->withErrors([
                'error' => 'Data tidak ditemukan.'
            ]);
        }

        // Check if token expired
        if ($token->isExpired()) {
            return redirect()->route('home')->withErrors([
                'token' => 'Token sudah kadaluarsa.'
            ]);
        }

        // Get or create participant test record
        $testType = TestType::where('code', 'kraepelin')->first();
        if (!$testType) {
            return redirect()->route('psikotest.general-instructions')->withErrors([
                'error' => 'Jenis tes tidak ditemukan.'
            ]);
        }

        $participantTest = ParticipantTest::firstOrCreate([
            'participant_id' => $participant->id,
            'test_type_id' => $testType->id,
        ]);

        // If test is already completed, redirect to general instructions
        if ($participantTest->isCompleted()) {
            return redirect()->route('psikotest.general-instructions')
                ->with('info', 'Tes Kraepelin sudah selesai.');
        }

        // Mark as started if not yet
        if ($participantTest->status === ParticipantTest::STATUS_NOT_STARTED) {
            $participantTest->markAsStarted();
            $participantTest->refresh(); // Ensure we have the started_at timestamp
        }

        // --- STRICT TIME-BASED LOGIC ---
        $testStartTime = $participantTest->started_at;
        $now = now();

        // Calculate total seconds elapsed since start
        // Use timestamps to avoid timezone confusion and ensure signed difference
        $elapsedSeconds = $testStartTime ? ($now->timestamp - $testStartTime->timestamp) : 0;

        // Clamp to 0 if negative (e.g. clock skew or future start date)
        $elapsedSeconds = max(0, $elapsedSeconds);

        // Calculate current session (1-indexed)
        $currentMinute = (int) floor($elapsedSeconds / self::SECONDS_PER_MINUTE) + 1;

        // Calculate time remaining in THIS session
        $secondsIntoSession = $elapsedSeconds % self::SECONDS_PER_MINUTE;
        $remainingSeconds = self::SECONDS_PER_MINUTE - $secondsIntoSession;

        // Check if overall test is finished
        if ($currentMinute > self::TOTAL_MINUTES) {
            return $this->markCompleted($request);
        }

        // Generate questions for the current minute (Session)
        $currentMinuteQuestions = $this->getOrGenerateQuestionsForMinute($participantId, $currentMinute);

        // Determine starting question index based on existing answers
        // We still need to know where to put the cursor if they refresh in the middle of a session
        $answeredCount = KraepelinAnswer::where('participant_id', $participantId)
            ->where('minute_number', $currentMinute)
            ->whereNotNull('user_answer')
            ->count();
        $lastAnsweredIndex = $answeredCount; // Start at count (e.g. 0 if none, 5 if 5 answered)

        // Summary of completed minutes
        // Optimization: Use a single query if performance is issue, but loop is fine for 50 items
        $existingAnswers = KraepelinAnswer::where('participant_id', $participantId)
            ->where('minute_number', '<', $currentMinute) // Only past minutes
            ->get();

        $minutesSummary = [];
        for ($m = 1; $m < $currentMinute; $m++) {
            $answersForMinute = $existingAnswers->where('minute_number', $m);
            $minutesSummary[] = [
                'minute' => $m,
                'answered' => $answersForMinute->whereNotNull('user_answer')->count(),
                'correct' => $answersForMinute->where('is_correct', true)->count(),
            ];
        }

        return Inertia::render('Psikotest/Kraepelin/KraepelinTest', [
            'participant' => [
                'id' => $participant->id,
                'name' => $participant->name,
            ],
            'testConfig' => [
                'totalMinutes' => self::TOTAL_MINUTES,
                'questionsPerMinute' => self::QUESTIONS_PER_MINUTE,
                'durationMinutes' => (self::TOTAL_MINUTES * self::SECONDS_PER_MINUTE) / 60, // Approximate total minutes
            ],
            'currentMinute' => $currentMinute,
            'questions' => $currentMinuteQuestions,
            'remainingSeconds' => $remainingSeconds, // Exact remaining seconds in current session
            'startedAt' => $testStartTime?->toIso8601String(),
            'minutesSummary' => $minutesSummary,
            'initialQuestionIndex' => $lastAnsweredIndex,
            'tokenExpiresAt' => $token->expires_at?->toIso8601String(),
            'tokenRemainingSeconds' => $token->getRemainingTimeSeconds(),
        ]);
    }

    /**
     * Generate or get questions for a specific minute
     */
    private function getOrGenerateQuestionsForMinute(int $participantId, int $minute): array
    {
        // Check if questions already exist
        $existing = KraepelinAnswer::where('participant_id', $participantId)
            ->where('minute_number', $minute)
            ->orderBy('question_index')
            ->get();

        if ($existing->count() >= self::QUESTIONS_PER_MINUTE) {
            return $existing->map(fn($a) => [
                'index' => $a->question_index,
                'number_a' => $a->number_a,
                'number_b' => $a->number_b,
                'user_answer' => $a->user_answer,
            ])->toArray();
        }

        // Generate new questions
        $questions = [];
        $existingIndexes = $existing->pluck('question_index')->toArray();

        for ($i = 0; $i < self::QUESTIONS_PER_MINUTE; $i++) {
            if (in_array($i, $existingIndexes)) {
                $existingQ = $existing->where('question_index', $i)->first();
                $questions[] = [
                    'index' => $i,
                    'number_a' => $existingQ->number_a,
                    'number_b' => $existingQ->number_b,
                    'user_answer' => $existingQ->user_answer,
                ];
            } else {
                $numberA = rand(1, 9);
                $numberB = rand(1, 9);

                // Pre-create the answer record
                KraepelinAnswer::create([
                    'participant_id' => $participantId,
                    'minute_number' => $minute,
                    'question_index' => $i,
                    'number_a' => $numberA,
                    'number_b' => $numberB,
                    'user_answer' => null,
                    'is_correct' => null,
                ]);

                $questions[] = [
                    'index' => $i,
                    'number_a' => $numberA,
                    'number_b' => $numberB,
                    'user_answer' => null,
                    'is_correct' => null,
                ];
            }
        }

        return $questions;
    }

    /**
     * Simpan jawaban untuk satu soal
     */
    /**
     * Simpan jawaban untuk satu soal.
     * Mendukung pembuatan soal secara dinamis dari Frontend (Lazy Loading / Instant Transition).
     */
    public function saveAnswer(Request $request)
    {
        $request->validate([
            'participant_id' => 'required|integer|exists:participants,id',
            'minute_number' => 'required|integer|min:1|max:' . self::TOTAL_MINUTES,
            'question_index' => 'required|integer|min:0|max:' . (self::QUESTIONS_PER_MINUTE - 1),
            'answer' => 'required|integer|min:0|max:9',
            'number_a' => 'required|integer|min:0|max:99', // Added validation for question data
            'number_b' => 'required|integer|min:0|max:99',
        ]);

        // Cari atau Buat Pertanyaan (untuk mendukung Frontend Generate)
        // Gunakan lockForUpdate atau atomicity jika perlu, tapi updateOrCreate cukup aman disini
        $answer = KraepelinAnswer::updateOrCreate(
            [
                'participant_id' => $request->participant_id,
                'minute_number' => $request->minute_number,
                'question_index' => $request->question_index,
            ],
            [
                'number_a' => $request->number_a,
                'number_b' => $request->number_b,
                'test_id' => $this->getTestIdForParticipant($request->participant_id), // Helper needed? Or just ignore test_id if nullable? 
                // Wait, KraepelinAnswer might need test_id (participant_test_id). 
                // Let's assume schema allows null or we fetch it.
                // Optimally we fetch the active test ID.
            ]
        );

        $correctAnswer = ($answer->number_a + $answer->number_b) % 10;
        $isCorrect = (int) $request->answer === (int) $correctAnswer;

        $answer->update([
            'user_answer' => $request->answer,
            'is_correct' => $isCorrect,
        ]);

        return response()->json(['success' => true]);
    }

    /**
     * Helper to get active test ID
     */
    private function getTestIdForParticipant($participantId)
    {
        $testType = TestType::where('code', 'kraepelin')->first();
        $pt = ParticipantTest::where('participant_id', $participantId)
            ->where('test_type_id', $testType->id)
            ->first();
        return $pt ? $pt->id : null;
    }

    /**
     * Pindah ke menit berikutnya atau selesaikan tes
     */
    public function nextMinute(Request $request)
    {
        // Simply redirect to show(), which recalculates everything based on time
        return redirect()->route('psikotest.kraepelin-test');
    }

    /**
     * Tandai tes Kraepelin sebagai selesai
     */
    public function markCompleted(Request $request)
    {
        $participantId = $request->input('participant_id') ?? $request->session()->get('participant_id');

        if (!$participantId) {
            return redirect()->route('home')->withErrors(['error' => 'Sesi tidak valid.']);
        }

        $testType = TestType::where('code', 'kraepelin')->first();

        $participantTest = ParticipantTest::where('participant_id', $participantId)
            ->where('test_type_id', $testType->id)
            ->first();

        if ($participantTest && !$participantTest->isCompleted()) {
            $participantTest->markAsCompleted();
            Log::info('KraepelinTestController@markCompleted: Kraepelin test completed for participant ' . $participantId);
        }

        return redirect()->route('psikotest.general-instructions')
            ->with('success', 'Tes Kraepelin berhasil diselesaikan!');
    }
}
