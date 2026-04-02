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
        Schema::create('kraepelin_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('participant_id')->constrained()->onDelete('cascade');
            $table->integer('minute_number');           // Menit ke-1 sampai ke-20
            $table->integer('question_index');          // Index soal dalam menit (0-19)
            $table->integer('number_a');                // Angka pertama (0-9)
            $table->integer('number_b');                // Angka kedua (0-9)
            $table->integer('user_answer')->nullable(); // Jawaban user (0-9)
            $table->boolean('is_correct')->nullable();  // Benar atau salah
            $table->timestamps();

            // Index untuk query cepat per menit
            $table->index(['participant_id', 'minute_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kraepelin_answers');
    }
};
