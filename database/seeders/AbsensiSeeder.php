<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Absensi;
use App\Models\Jadwal;
use App\Models\Mahasiswa;
use Carbon\Carbon;

class AbsensiSeeder extends Seeder
{
    public function run(): void
    {
        $jadwal = Jadwal::with('kelas')->get();
        $statusList = ['Hadir', 'Sakit', 'Izin', 'Alpa'];
        
        // Bobot probabilitas untuk setiap status (hadir lebih tinggi)
        $statusWeights = [
            'Hadir' => 70,  // 70% kemungkinan hadir
            'Sakit' => 10,  // 10% kemungkinan sakit
            'Izin' => 10,   // 10% kemungkinan izin
            'Alpa' => 10   // 10% kemungkinan alpha
        ];
        
        $created = 0;
        
        // Simulasi absensi untuk 8 minggu terakhir
        $startDate = Carbon::now()->subWeeks(8);
        
        foreach ($jadwal as $jadwalItem) {
            // Ambil mahasiswa yang ada di kelas ini
            $mahasiswa = Mahasiswa::where('kelas_id', $jadwalItem->kelas_id)->get();
            
            if ($mahasiswa->isEmpty()) {
                continue;
            }
            
            // Buat absensi untuk 8 pertemuan terakhir
            for ($pertemuan = 1; $pertemuan <= 8; $pertemuan++) {
                $tanggalPertemuan = $startDate->copy()->addWeeks($pertemuan - 1);
                
                foreach ($mahasiswa as $mhs) {
                    // Pilih status berdasarkan bobot
                    $status = $this->getWeightedRandomStatus($statusWeights);
                    
                    // Generate keterangan untuk status selain Hadir
                    $keterangan = null;
                    if ($status === 'Sakit') {
                        $keterangan = fake()->randomElement(['Demam', 'Flu', 'Sakit kepala', 'Sakit perut', 'Batuk pilek']);
                    } elseif ($status === 'Izin') {
                        $keterangan = fake()->randomElement(['Keperluan keluarga', 'Acara penting', 'Urusan pribadi', 'Acara keluarga']);
                    } elseif ($status === 'Alpa') {
                        $keterangan = rand(0, 1) ? fake()->randomElement(['Terlambat bangun', 'Lupa jadwal', 'Kendaraan rusak']) : null;
                    }
                    
                    Absensi::create([
                        'mahasiswa_id' => $mhs->id,
                        'jadwal_id' => $jadwalItem->id,
                        'tanggal' => $tanggalPertemuan->format('Y-m-d'),
                        'status' => $status,
                        'keterangan' => $keterangan,
                    ]);
                    
                    $created++;
                }
            }
        }
        
        $this->command->info("✓ Berhasil membuat {$created} data absensi");
    }
    
    private function getWeightedRandomStatus(array $weights): string
    {
        $rand = rand(1, 100);
        $sum = 0;
        
        foreach ($weights as $status => $weight) {
            $sum += $weight;
            if ($rand <= $sum) {
                return $status;
            }
        }
        
        return 'Hadir';
    }
}
