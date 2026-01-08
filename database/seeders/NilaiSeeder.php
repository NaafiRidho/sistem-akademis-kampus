<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Nilai;
use App\Models\Mahasiswa;
use App\Models\MataKuliah;

class NilaiSeeder extends Seeder
{
    public function run(): void
    {
        $mahasiswa = Mahasiswa::all();
        $mataKuliah = MataKuliah::all();
        
        if ($mahasiswa->isEmpty() || $mataKuliah->isEmpty()) {
            $this->command->error("Data mahasiswa atau mata kuliah kosong!");
            return;
        }
        
        $created = 0;
        
        foreach ($mahasiswa as $mhs) {
            // Ambil 5-8 mata kuliah random untuk setiap mahasiswa
            $mkList = $mataKuliah->random(min(rand(5, 8), $mataKuliah->count()));
            
            foreach ($mkList as $mk) {
                // Generate nilai random 50-100
                $tugasNilai = rand(50, 100);
                $utsNilai = rand(50, 100);
                $uasNilai = rand(50, 100);
                
                // Hitung nilai akhir (bobot: Tugas 30%, UTS 30%, UAS 40%)
                $nilaiAkhir = ($tugasNilai * 0.30) + ($utsNilai * 0.30) + ($uasNilai * 0.40);
                
                // Tentukan grade
                $grade = 'E';
                if ($nilaiAkhir >= 85) $grade = 'A';
                elseif ($nilaiAkhir >= 75) $grade = 'B';
                elseif ($nilaiAkhir >= 65) $grade = 'C';
                elseif ($nilaiAkhir >= 55) $grade = 'D';
                
                Nilai::create([
                    'mahasiswa_id' => $mhs->id,
                    'mata_kuliah_id' => $mk->id,
                    'tugas' => $tugasNilai,
                    'uts' => $utsNilai,
                    'uas' => $uasNilai,
                    'nilai_akhir' => round($nilaiAkhir, 2),
                    'grade' => $grade,
                    'semester' => rand(1, 8),
                    'tahun_ajaran' => '2024/2025',
                ]);
                
                $created++;
            }
        }
        
        $this->command->info("✓ Berhasil membuat {$created} data nilai");
    }
}
