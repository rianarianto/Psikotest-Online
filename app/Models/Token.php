<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Token extends Model
{
    use HasFactory;

    protected $fillable = [
        'token',
        'test_type',
        'status',
        'used_by',
        'used_at',
        'intended_for_name',
        'intended_for_email',
        'assigned_tests',
        'expires_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'used_at' => 'datetime',
        'expires_at' => 'datetime',
        'assigned_tests' => 'array',
    ];

    // Relasi ke model Participant
    public function participant()
    {
        return $this->belongsTo(Participant::class, 'used_by');
    }

    /**
     * Check if token is expired
     */
    public function isExpired(): bool
    {
        if (!$this->expires_at) {
            return false;
        }
        return Carbon::now()->isAfter($this->expires_at);
    }


    /**
     * Get remaining time in seconds
     */
    public function getRemainingTimeSeconds(): int
    {
        if (!$this->expires_at) {
            return 0;
        }

        $remaining = Carbon::now()->diffInSeconds($this->expires_at, false);
        return max(0, $remaining);
    }

    /**
     * Get assigned test codes (with backward compatibility)
     */
    public function getAssignedTestCodes(): array
    {
        // If assigned_tests is set, use it
        if (!empty($this->assigned_tests)) {
            return $this->assigned_tests;
        }

        // Backward compatibility: convert old test_type to array
        switch ($this->test_type) {
            case 'papi':
                return ['papi'];
            case 'kraepelin':
                return ['kraepelin'];
            case 'kraepelin,papi':
                return ['papi', 'kraepelin'];
            default:
                return [];
        }
    }
}

