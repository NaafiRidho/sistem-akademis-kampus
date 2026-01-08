<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PengumpulanTugas;
use App\Models\Tugas;
use App\Models\Mahasiswa;

class PengumpulanTugasSeeder extends Seeder
{
    public function run(): void
    {
        $tugas = Tugas::all();
        $mahasiswa = Mahasiswa::all();
        
        if ($tugas->isEmpty() || $mahasiswa->isEmpty()) {
            $this->command->error("Data tugas atau mahasiswa kosong!");
            return;
        }
        
        $created = 0;
        
        foreach ($tugas as $tugasItem) {
            // 70% mahasiswa mengumpulkan tugas
            $mahasiswaYangMengumpulkan = $mahasiswa->random(min((int)($mahasiswa->count() * 0.7), $mahasiswa->count()));
            
            foreach ($mahasiswaYangMengumpulkan as $mhs) {
                // Random nilai 60-100
                $nilai = rand(60, 100);
                
                PengumpulanTugas::create([
                    'tugas_id' => $tugasItem->id,
                    'mahasiswa_id' => $mhs->id,
                    'file' => "pengumpulan/tugas-{$tugasItem->id}-mahasiswa-{$mhs->id}.pdf",
                    'nilai' => $nilai,
                ]);
                
                $created++;
            }
        }
        
        $this->command->info("✓ Berhasil membuat {$created} pengumpulan tugas");
    }
}
