<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KraepelinAnswer extends Model
{
    use HasFactory;

    protected $fillable = [
        'participant_id',
        'minute_number',
        'question_index',
        'number_a',
        'number_b',
        'user_answer',
        'is_correct',
    ];

    protected $casts = [
        'minute_number' => 'integer',
        'question_index' => 'integer',
        'number_a' => 'integer',
        'number_b' => 'integer',
        'user_answer' => 'integer',
        'is_correct' => 'boolean',
    ];

    /**
     * Get the participant
     */
    public function participant()
    {
        return $this->belongsTo(Participant::class);
    }

    /**
     * Calculate the correct answer (last digit of sum)
     */
    public function getCorrectAnswerAttribute(): int
    {
        return ($this->number_a + $this->number_b) % 10;
    }

    /**
     * Check if user answer is correct
     */
    public function checkAnswer(): bool
    {
        if ($this->user_answer === null) {
            return false;
        }
        return $this->user_answer === $this->correct_answer;
    }

    /**
     * Scope untuk mengambil jawaban per menit
     */
    public function scopeForMinute($query, int $minute)
    {
        return $query->where('minute_number', $minute);
    }

    /**
     * Scope untuk mengambil jawaban peserta tertentu
     */
    public function scopeForParticipant($query, int $participantId)
    {
        return $query->where('participant_id', $participantId);
    }
}
