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
                
                // Random waktu pengumpulan (sebelum atau sesudah deadline)
                $deadline = \Carbon\Carbon::parse($tugasItem->deadline);
                $waktuPengumpulan = rand(0, 100) > 20 
                    ? $deadline->copy()->subDays(rand(1, 7)) // 80% tepat waktu
                    : $deadline->copy()->addDays(rand(1, 3)); // 20% terlambat
                
                PengumpulanTugas::create([
                    'tugas_id' => $tugasItem->id,
                    'mahasiswa_id' => $mhs->id,
                    'file_path' => "pengumpulan/tugas-{$tugasItem->id}-mahasiswa-{$mhs->id}.pdf",
                    'waktu_pengumpulan' => $waktuPengumpulan,
                    'nilai' => rand(0, 100) > 30 ? $nilai : null, // 70% sudah dinilai
                    'catatan' => rand(0, 100) > 50 ? 'Bagus, pertahankan!' : null,
                ]);
                
                $created++;
            }
        }
        
        $this->command->info("✓ Berhasil membuat {$created} pengumpulan tugas");
    }
}
