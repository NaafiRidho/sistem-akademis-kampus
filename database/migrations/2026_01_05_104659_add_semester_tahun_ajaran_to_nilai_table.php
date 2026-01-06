<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('nilai', function (Blueprint $table) {
            $table->integer('semester')->after('mata_kuliah_id')->nullable();
            $table->string('tahun_ajaran', 9)->after('semester')->nullable();
        });
        
        // Add index separately
        try {
            DB::statement('CREATE INDEX idx_nilai_semester ON nilai (semester, tahun_ajaran)');
        } catch (\Exception $e) {
            // Index might already exist, ignore
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Try to drop both possible index names (old and new)
        try {
            DB::statement('ALTER TABLE nilai DROP INDEX idx_nilai_lookup');
        } catch (\Exception $e) {
            // Index might not exist, continue
        }
        
        try {
            DB::statement('ALTER TABLE nilai DROP INDEX idx_nilai_semester');
        } catch (\Exception $e) {
            // Index might not exist, continue
        }
        
        Schema::table('nilai', function (Blueprint $table) {
            $table->dropColumn(['semester', 'tahun_ajaran']);
        });
    }
};
