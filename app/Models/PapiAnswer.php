<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PapiAnswer extends Model
{
    use HasFactory;

    // Nama tabel yang terkait dengan model ini harus 'papi_answers'
    protected $table = 'papi_answers';

    // Kolom yang dapat diisi secara massal (mass assignable)
    protected $fillable = [
        'participant_id',
        'question_id',
        'answer', // Kolom ini sekarang bernama 'answer', bukan 'answer_value'
    ];

    /**
     * Dapatkan peserta yang memiliki jawaban ini.
     */
    public function participant()
    {
        return $this->belongsTo(Participant::class);
    }

    /**
     * Dapatkan pertanyaan PapiKostick yang terkait dengan jawaban ini.
     */
    public function question()
    {
        // Sesuaikan jika model pertanyaan Anda bukan PapiQuestion
        return $this->belongsTo(PapiQuestion::class);
    }
}