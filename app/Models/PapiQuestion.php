<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PapiQuestion extends Model
{
    use HasFactory;

    // Pastikan kolom ini bisa diisi secara massal
    protected $fillable = [
        'statement_a',
        'statement_b',
        'choice_a_trait',
        'choice_b_trait',
    ];
}
