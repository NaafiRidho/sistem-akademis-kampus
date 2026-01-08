<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Diskusi;
use App\Models\MataKuliah;
use App\Models\User;

class DiskusiSeeder extends Seeder
{
    public function run(): void
    {
        $mataKuliah = MataKuliah::all();
        // Ambil user dengan role_id 2 (dosen) dan 3 (mahasiswa)
        $users = User::whereIn('role_id', [2, 3])->get();
        
        if ($mataKuliah->isEmpty() || $users->isEmpty()) {
            $this->command->error("Data mata kuliah atau user kosong!");
            return;
        }
        
        $topikDiskusi = [
            'Bagaimana cara menyelesaikan soal latihan nomor 5?',
            'Apakah ada referensi tambahan untuk materi ini?',
            'Kapan jadwal ujian tengah semester?',
            'Bisa dijelaskan ulang tentang konsep ini?',
            'Saya kesulitan memahami bagian ini, bisa dibantu?',
            'Adakah contoh kasus nyata dari materi ini?',
            'Apakah tugas bisa dikumpulkan dalam format lain?',
            'Mohon penjelasan lebih detail tentang praktikum',
        ];
        
        $created = 0;
        
        foreach ($mataKuliah->random(min(20, $mataKuliah->count())) as $mk) {
            // Buat 2-5 diskusi per mata kuliah
            $jumlahDiskusi = rand(2, 5);
            
            for ($i = 0; $i < $jumlahDiskusi; $i++) {
                $userRandom = $users->random();
                $topik = $topikDiskusi[array_rand($topikDiskusi)];
                
                Diskusi::create([
                    'mata_kuliah_id' => $mk->id,
                    'user_id' => $userRandom->id,
                    'pesan' => $topik,
                ]);
                
                $created++;
            }
        }
        
        $this->command->info("✓ Berhasil membuat {$created} diskusi");
    }
}
