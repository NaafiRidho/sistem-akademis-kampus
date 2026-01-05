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
        Schema::table('nilai', function (Blueprint $table) {
            $table->integer('semester')->after('mata_kuliah_id')->nullable();
            $table->string('tahun_ajaran', 9)->after('semester')->nullable();
            
            // Add index for better query performance
            $table->index(['mahasiswa_id', 'mata_kuliah_id', 'semester', 'tahun_ajaran'], 'idx_nilai_lookup');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('nilai', function (Blueprint $table) {
            $table->dropIndex('idx_nilai_lookup');
            $table->dropColumn(['semester', 'tahun_ajaran']);
        });
    }
};
