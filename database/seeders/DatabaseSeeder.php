<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            // Master Data
            RoleSeeder::class,
            FakultasSeeder::class,
            ProdiSeeder::class,
            
            // Kelas dan User
            KelasSeeder::class,
            UserSeeder::class,
            DosenSeeder::class,
            MahasiswaSeeder::class,
            
            // Akademik
            MataKuliahSeeder::class,
            JadwalSeeder::class,
            
            // Pembelajaran
            MateriSeeder::class,
            TugasSeeder::class,
            PengumpulanTugasSeeder::class,
            
            // Penilaian dan Kehadiran
            AbsensiSeeder::class,
            NilaiSeeder::class,
            
            // Komunikasi
            PengumumanSeeder::class,
            DiskusiSeeder::class,
        ]);

        $this->command->info('');
        $this->command->info('====================================');
        $this->command->info('✓ Semua seeder berhasil dijalankan!');
        $this->command->info('====================================');
    }
}
