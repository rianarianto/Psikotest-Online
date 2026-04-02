<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tokens', function (Blueprint $table) {
            // Kolom untuk menentukan tes mana yang harus dikerjakan
            // Format: ["papi", "kraepelin"] atau ["papi"] saja
            $table->json('assigned_tests')->nullable()->after('test_type');

            // Durasi validity token dalam jam (default 48 jam = 2 hari)
            $table->integer('valid_duration_hours')->default(48)->after('assigned_tests');

            // Kapan token kadaluarsa (dihitung saat token pertama kali digunakan)
            $table->timestamp('expires_at')->nullable()->after('valid_duration_hours');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tokens', function (Blueprint $table) {
            $table->dropColumn(['assigned_tests', 'valid_duration_hours', 'expires_at']);
        });
    }
};
