<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB; // Pastikan ini ada

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Untuk SQLite, mengubah ENUM langsung tidak didukung, jadi pendekatan ini digunakan.
        // Sekarang kita beralih ke MySQL/MariaDB, kita perlu memastikan sintaksnya benar.
        // Masalah terjadi pada `default ''unused''` saat renameColumn.

        Schema::table('tokens', function (Blueprint $table) {
            // 1. Tambahkan kolom sementara dengan nama berbeda (misal: status_new)
            // Tipe string digunakan. Default value 'unused'.
            // Perhatikan bahwa `string()` di Laravel akan menjadi VARCHAR(255) di MySQL/MariaDB.
            $table->string('status_new')->default('unused');
        });

        // 2. Salin data dari kolom lama ke kolom baru
        DB::table('tokens')->get()->each(function ($token) {
            $status = $token->status; // Ambil nilai status lama
            DB::table('tokens')
                ->where('id', $token->id)
                ->update(['status_new' => $status]);
        });

        Schema::table('tokens', function (Blueprint $table) {
            // 3. Hapus kolom 'status' lama
            $table->dropColumn('status');
        });

        // 4. Ganti nama kolom 'status_new' menjadi 'status'
        // Menggunakan DB::statement untuk menghindari masalah quoting pada default value.
        // Sesuaikan 'utf8mb4_unicode_ci' jika collation database Anda berbeda.
        DB::statement("ALTER TABLE `tokens` CHANGE `status_new` `status` VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'unused'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Saat rollback, kita perlu melakukan proses yang sama secara terbalik
        // Mengembalikan kolom status ke ENUM('unused', 'used') atau string sesuai kebutuhan Anda saat rollback.

        Schema::table('tokens', function (Blueprint $table) {
            // 1. Buat kolom sementara baru (status_old_enum)
            // Default value 'unused'.
            $table->string('status_old_enum')->default('unused');
        });

        // 2. Salin data dari kolom 'status' (yang sekarang TEXT) ke kolom 'status_old_enum'
        DB::table('tokens')->get()->each(function ($token) {
            $status = $token->status;
            DB::table('tokens')
                ->where('id', $token->id)
                ->update(['status_old_enum' => $status]);
        });

        Schema::table('tokens', function (Blueprint $table) {
            // 3. Hapus kolom 'status' yang sekarang
            $table->dropColumn('status');
        });

        // 4. Ganti nama kolom 'status_old_enum' menjadi 'status'
        // Menggunakan DB::statement untuk menghindari masalah quoting pada default value.
        DB::statement("ALTER TABLE `tokens` CHANGE `status_old_enum` `status` VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'unused'");

        // Catatan: Setelah rollback, kolom 'status' akan kembali menjadi TEXT (VARCHAR).
        // Jika Anda benar-benar ingin mengembalikan ke ENUM di MySQL/PostgreSQL
        // (jika Anda beralih DB), Anda perlu migrasi lain yang secara eksplisit mengubah tipe ke ENUM.
    }
};
