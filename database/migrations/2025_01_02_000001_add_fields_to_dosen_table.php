<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('dosen', function (Blueprint $table) {
            $table->string('no_telepon')->nullable()->after('email');
            $table->string('pendidikan_terakhir')->nullable()->after('no_telepon');
            $table->foreignId('prodi_id')->nullable()->after('pendidikan_terakhir')->constrained('prodi')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('dosen', function (Blueprint $table) {
            $table->dropForeign(['prodi_id']);
            $table->dropColumn(['no_telepon', 'pendidikan_terakhir', 'prodi_id']);
        });
    }
};
