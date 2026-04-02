<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('tokens', function (Blueprint $table) {
            // Mengubah tipe data menjadi string agar bisa menampung "papi,kraepelin"
            $table->string('test_type')->change();
        });
    }

    public function down(): void
    {
        Schema::table('tokens', function (Blueprint $table) {
            // Jika ingin balik ke ENUM (opsional)
            $table->enum('test_type', ['papi', 'kraepelin', 'alltest'])->change();
        });
    }
};
