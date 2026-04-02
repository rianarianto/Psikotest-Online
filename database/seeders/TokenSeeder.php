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
        // Menonaktifkan pemeriksaan foreign key sementara
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // Hapus token yang sudah ada untuk menghindari duplikasi saat seeding ulang
        // Ini akan berhasil setelah foreign key checks dinonaktifkan
        Token::truncate();

        // Mengaktifkan kembali pemeriksaan foreign key
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

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
