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
        Schema::table('participants', function (Blueprint $table) {
            $table->dropColumn(['papi_test_status', 'papi_test_started_at', 'test_completed_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('participants', function (Blueprint $table) {
            $table->string('papi_test_status')->default('not_started')->nullable();
            $table->timestamp('papi_test_started_at')->nullable();
            $table->timestamp('test_completed_at')->nullable();
        });
    }
};
