<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tokens', function (Blueprint $table) {
            // Menambahkan kolom untuk menyimpan nama dan email peserta yang dituju
            // Ini akan diisi saat token dibuat oleh admin
            $table->string('intended_for_name')->nullable()->after('token');
            $table->string('intended_for_email')->nullable()->after('intended_for_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tokens', function (Blueprint $table) {
            // Menghapus kolom jika migrasi di-rollback
            $table->dropColumn('intended_for_email');
            $table->dropColumn('intended_for_name');
        });
    }
};

