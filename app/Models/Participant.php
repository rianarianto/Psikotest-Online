<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Participant extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'age',
        'position',
        'institution',
        'token_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    // Relasi dengan model Token
    public function token()
    {
        return $this->belongsTo(Token::class);
    }

    // Relasi dengan PapiAnswer
    public function papiAnswers()
    {
        return $this->hasMany(PapiAnswer::class);
    }

    // Relasi dengan ParticipantTest (status tes per jenis)
    public function participantTests()
    {
        return $this->hasMany(ParticipantTest::class);
    }

    // Relasi dengan KraepelinAnswer
    public function kraepelinAnswers()
    {
        return $this->hasMany(KraepelinAnswer::class);
    }

    /**
     * Get test status for a specific test type
     */
    public function getTestStatus(string $testCode): ?ParticipantTest
    {
        return $this->participantTests()
            ->whereHas('testType', fn($q) => $q->where('code', $testCode))
            ->first();
    }

    /**
     * Check if all assigned tests are completed
     */
    public function allTestsCompleted(): bool
    {
        $assignedTestCodes = $this->token ? $this->token->getAssignedTestCodes() : [];

        if (empty($assignedTestCodes)) {
            // Case where no tests are assigned should be considered complete or handled gracefully
            // In the General Instructions hub, empty tests results in "allCompleted = true" in JS.
            return true; 
        }

        // Only check tests that are actually registered and active in the system
        $activeTests = \App\Models\TestType::whereIn('code', $assignedTestCodes)
            ->active()
            ->get();

        if ($activeTests->isEmpty()) {
            return true;
        }

        foreach ($activeTests as $testType) {
            $status = $this->getTestStatus($testType->code);
            if (!$status || !$status->isCompleted()) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get the test that is currently in progress
     */
    public function getTestInProgress(): ?ParticipantTest
    {
        return $this->participantTests()
            ->where('status', ParticipantTest::STATUS_IN_PROGRESS)
            ->first();
    }

    /**
     * Get the last answered Papi question number
     * Returns the next question to answer (1-indexed)
     */
    public function getPapiNextQuestion(): int
    {
        $lastAnswer = $this->papiAnswers()
            ->orderBy('question_id', 'desc')
            ->first();

        return $lastAnswer ? $lastAnswer->question_id + 1 : 1;
    }

    /**
     * Get the Kraepelin progress (last minute and question answered)
     * Returns [minute, question_index] for next question to answer
     */
    public function getKraepelinProgress(): array
    {
        $lastAnswer = $this->kraepelinAnswers()
            ->orderBy('minute_number', 'desc')
            ->orderBy('question_index', 'desc')
            ->first();

        if (!$lastAnswer) {
            return ['minute' => 1, 'question_index' => 0];
        }

        // If last question in a minute (index 19), move to next minute
        if ($lastAnswer->question_index >= 19) {
            return ['minute' => $lastAnswer->minute_number + 1, 'question_index' => 0];
        }

        return [
            'minute' => $lastAnswer->minute_number,
            'question_index' => $lastAnswer->question_index + 1
        ];
    }
}
