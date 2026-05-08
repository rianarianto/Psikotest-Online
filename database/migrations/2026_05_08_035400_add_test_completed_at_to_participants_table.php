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
        if (!Schema::hasColumn('participants', 'test_completed_at')) {
            Schema::table('participants', function (Blueprint $table) {
                $table->timestamp('test_completed_at')->nullable()->after('papi_test_started_at');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('participants', function (Blueprint $table) {
            $table->dropColumn('test_completed_at');
        });
    }
};
