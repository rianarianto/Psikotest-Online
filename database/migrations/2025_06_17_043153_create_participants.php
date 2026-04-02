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
        Schema::create('participants', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->integer('age');
            $table->string('position');
            $table->string('institution');
            $table->foreignId('token_id')->constrained('tokens')->onDelete('cascade');
            $table->string('papi_test_status')->default('not_started');
            // Menambahkan kolom waktu mulai tes PapiKostick
            $table->timestamp('papi_test_started_at')->nullable(); // Nullable karena mungkin belum dimulai
            // Menambahkan kolom waktu selesai tes (baru)
            $table->timestamp('test_completed_at')->nullable(); // Nullable karena mungkin belum selesai
            $table->timestamps(); // created_at dan updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('participants');
    }
};
