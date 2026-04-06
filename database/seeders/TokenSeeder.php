<?php

namespace Database\Seeders;

use App\Models\Token;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TokenSeeder extends Seeder
{
    public function run(): void
    {
        // Buat 20 token baru
        for ($i = 0; $i < 20; $i++) {
            Token::create([
                'token' => 'PAPI-' . Str::random(8), // Menggunakan Str::random untuk token unik
                'test_type' => 'papi',
                'status' => 'unused',
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
    }
}
