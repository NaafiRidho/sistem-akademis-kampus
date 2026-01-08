<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Jadwal;
use App\Models\Dosen;
use App\Models\MataKuliah;
use App\Models\Kelas;

class JadwalSeeder extends Seeder
{
    public function run(): void
    {
        $dosen = Dosen::all();
        $kelas = Kelas::all();
        
        $hariList = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        $jamMulaiList = ['07:00:00', '08:50:00', '10:40:00', '13:00:00', '14:50:00', '16:40:00'];
        
        $created = 0;
        
        foreach ($kelas as $kelasItem) {
            // Ambil mata kuliah yang sesuai dengan prodi kelas
            $mataKuliah = MataKuliah::where('prodi_id', $kelasItem->prodi_id)->get();
            
            if ($mataKuliah->isEmpty()) {
                continue;
            }
            
            // Buat 4-6 jadwal per kelas (4-6 mata kuliah berbeda)
            $jumlahJadwal = rand(4, 6);
            $usedHari = [];
            
            foreach ($mataKuliah->random(min($jumlahJadwal, $mataKuliah->count())) as $mk) {
                // Pilih dosen random
                $dosenRandom = $dosen->random();
                
                // Pilih hari yang belum dipakai untuk kelas ini
                $availableHari = array_diff($hariList, $usedHari);
                if (empty($availableHari)) {
                    $availableHari = $hariList; // Reset jika semua hari sudah terpakai
                    $usedHari = [];
                }
                
                $hari = $availableHari[array_rand($availableHari)];
                $usedHari[] = $hari;
                
                // Pilih jam mulai
                $jamMulai = $jamMulaiList[array_rand($jamMulaiList)];
                
                // Hitung jam selesai berdasarkan SKS (1 SKS = 50 menit)
                $durasi = $mk->sks * 50; // dalam menit
                $jamSelesai = date('H:i:s', strtotime($jamMulai) + ($durasi * 60));
                
                Jadwal::create([
                    'mata_kuliah_id' => $mk->id,
                    'dosen_id' => $dosenRandom->id,
                    'kelas_id' => $kelasItem->id,
                    'hari' => $hari,
                    'jam_mulai' => $jamMulai,
                    'jam_selesai' => $jamSelesai,
                    'ruangan' => 'R.' . rand(101, 599), // Ruangan R.101 - R.599
                ]);
                
                $created++;
            }
        }
        
        $this->command->info("✓ Berhasil membuat {$created} jadwal");
    }
}
