<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\TestType;

class TestTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $testTypes = [
            [
                'code' => 'papi',
                'name' => 'Tes PapiKostick',
                'description' => 'Tes kepribadian untuk mengukur 20 sifat/trait kepribadian melalui 90 pasangan pernyataan.',
                'duration_minutes' => 90,
                'instruction_route' => 'psikotest.papi-instructions',
                'test_route' => 'psikotest.papi-test',
                'icon' => 'clipboard-list',
                'is_active' => true,
                'order' => 1,
            ],
            [
                'code' => 'kraepelin',
                'name' => 'Tes Kraepelin',
                'description' => 'Tes kecepatan dan ketahanan mental melalui penjumlahan angka selama 20 menit.',
                'duration_minutes' => 20,
                'instruction_route' => 'psikotest.kraepelin-instructions',
                'test_route' => 'psikotest.kraepelin-test',
                'icon' => 'calculator',
                'is_active' => true,
                'order' => 2,
            ],
        ];

        foreach ($testTypes as $type) {
            TestType::updateOrCreate(
                ['code' => $type['code']],
                $type
            );
        }
    }
}
