<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TestType extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'description',
        'duration_minutes',
        'instruction_route',
        'test_route',
        'icon',
        'is_active',
        'order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'duration_minutes' => 'integer',
        'order' => 'integer',
    ];

    /**
     * Get all participant tests for this test type
     */
    public function participantTests()
    {
        return $this->hasMany(ParticipantTest::class);
    }

    /**
     * Scope untuk mengambil tes yang aktif saja
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope untuk mengurutkan berdasarkan order
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('order');
    }
}
