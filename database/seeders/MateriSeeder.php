<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Materi;
use App\Models\MataKuliah;
use App\Models\Dosen;

class MateriSeeder extends Seeder
{
    public function run(): void
    {
        $mataKuliah = MataKuliah::all();
        $dosen = Dosen::all();
        
        if ($mataKuliah->isEmpty() || $dosen->isEmpty()) {
            $this->command->error("Data mata kuliah atau dosen kosong!");
            return;
        }
        
        $created = 0;
        
        foreach ($mataKuliah as $mk) {
            // Buat 5-8 materi per mata kuliah
            $jumlahMateri = rand(5, 8);
            
            for ($i = 1; $i <= $jumlahMateri; $i++) {
                $dosenRandom = $dosen->random();
                
                Materi::create([
                    'mata_kuliah_id' => $mk->id,
                    'dosen_id' => $dosenRandom->id,
                    'judul' => "Pertemuan {$i}: {$mk->nama_mk}",
                    'file' => "materi/pertemuan-{$i}-" . strtolower(str_replace(' ', '-', $mk->nama_mk)) . ".pdf",
                ]);
                
                $created++;
            }
        }
        
        $this->command->info("✓ Berhasil membuat {$created} materi");
    }
}
