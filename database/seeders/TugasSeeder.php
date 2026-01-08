<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Tugas;
use App\Models\MataKuliah;
use App\Models\Dosen;
use Carbon\Carbon;

class TugasSeeder extends Seeder
{
    public function run(): void
    {
        $mataKuliah = MataKuliah::all();
        $dosen = Dosen::all();
        
        if ($mataKuliah->isEmpty() || $dosen->isEmpty()) {
            $this->command->error("Data mata kuliah atau dosen kosong!");
            return;
        }
        
        $tipeTugas = ['Essay', 'Praktikum', 'Project', 'Laporan', 'Presentasi', 'Quiz'];
        
        $created = 0;
        
        foreach ($mataKuliah as $mk) {
            // Buat 2-4 tugas per mata kuliah
            $jumlahTugas = rand(2, 4);
            
            for ($i = 1; $i <= $jumlahTugas; $i++) {
                $dosenRandom = $dosen->random();
                $tipe = $tipeTugas[array_rand($tipeTugas)];
                
                // Deadline random 7-14 hari dari sekarang
                $deadline = Carbon::now()->addDays(rand(7, 14));
                
                Tugas::create([
                    'mata_kuliah_id' => $mk->id,
                    'dosen_id' => $dosenRandom->id,
                    'judul' => "Tugas {$tipe} {$i}: {$mk->nama_mk}",
                    'deskripsi' => "Tugas {$tipe} untuk mata kuliah {$mk->nama_mk}. Kerjakan dengan baik dan kumpulkan sebelum deadline.",
                    'deadline' => $deadline,
                ]);
                
                $created++;
            }
        }
        
        $this->command->info("✓ Berhasil membuat {$created} tugas");
    }
}
