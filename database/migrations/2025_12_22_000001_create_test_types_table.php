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
        Schema::create('test_types', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();          // 'papi', 'kraepelin', dll
            $table->string('name');                    // 'Tes PapiKostick'
            $table->text('description')->nullable();
            $table->integer('duration_minutes');       // Durasi tes dalam menit
            $table->string('instruction_route');       // Route ke halaman instruksi
            $table->string('test_route');              // Route ke halaman tes
            $table->string('icon')->nullable();        // Icon untuk UI (optional)
            $table->boolean('is_active')->default(true);
            $table->integer('order')->default(0);      // Urutan tampil di UI
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('test_types');
    }
};
