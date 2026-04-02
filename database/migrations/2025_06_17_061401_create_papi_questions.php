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
        Schema::create('papi_questions', function (Blueprint $table) {
            $table->id();
            $table->text('statement_a'); // Kolom Pernyataan A
            $table->text('statement_b'); // Kolom Pernyataan B
            $table->string('choice_a_trait', 10)->nullable(); // Sifat untuk pilihan A (baru)
            $table->string('choice_b_trait', 10)->nullable(); // Sifat untuk pilihan B (baru)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('papi_questions');
    }
};

