<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Kelas;
use App\Models\Prodi;

class KelasSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ambil semua prodi
        $prodis = Prodi::all();

        if ($prodis->isEmpty()) {
            $this->command->warn('Tidak ada data prodi. Jalankan seeder prodi terlebih dahulu!');
            return;
        }

        // Hapus data kelas yang sudah ada (dengan disable foreign key check)
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Kelas::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $kelasData = [];
        
        foreach ($prodis as $prodi) {
            // Ambil inisial prodi (2-3 huruf pertama dari nama prodi)
            $inisial = $this->getInisialProdi($prodi->nama_prodi);
            
            // Buat kelas untuk setiap semester (1-8)
            for ($semester = 1; $semester <= 8; $semester++) {
                // Buat 2-3 kelas paralel per semester
                $jumlahKelasParalel = $semester <= 4 ? 3 : 2; // Semester 1-4: 3 kelas, 5-8: 2 kelas
                
                for ($paralel = 0; $paralel < $jumlahKelasParalel; $paralel++) {
                    $hurufKelas = chr(65 + $paralel); // A, B, C, ...
                    
                    $kelasData[] = [
                        'nama_kelas' => "{$inisial}-{$semester}{$hurufKelas}",
                        'prodi_id' => $prodi->id,
                        'semester' => $semester % 2 == 1 ? 'Ganjil' : 'Genap',
                        'tahun_ajaran' => '2024/2025',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
            }
        }

        // Insert semua data kelas
        Kelas::insert($kelasData);

        $this->command->info('✓ Berhasil membuat ' . count($kelasData) . ' kelas');
        
        // Tampilkan contoh kelas yang dibuat
        $this->command->newLine();
        $this->command->info('Contoh kelas yang dibuat:');
        foreach ($prodis->take(2) as $prodi) {
            $inisial = $this->getInisialProdi($prodi->nama_prodi);
            $this->command->line("  - Prodi {$prodi->nama_prodi}: {$inisial}-1A, {$inisial}-1B, {$inisial}-1C, ..., {$inisial}-8B");
        }
    }

    /**
     * Dapatkan inisial prodi untuk nama kelas
     */
    private function getInisialProdi(string $namaProdi): string
    {
        // Mapping nama prodi ke inisial
        $mapping = [
            'Teknik Informatika' => 'TI',
            'Sistem Informasi' => 'SI',
            'Teknik Komputer' => 'TK',
            'Manajemen Informatika' => 'MI',
            'Ilmu Komputer' => 'IK',
            'Teknik Elektro' => 'TE',
            'Teknik Mesin' => 'TM',
            'Teknik Sipil' => 'TS',
            'Arsitektur' => 'AR',
            'Teknik Industri' => 'TIN',
            'Manajemen' => 'MJ',
            'Akuntansi' => 'AK',
            'Ekonomi Pembangunan' => 'EP',
            'Hukum' => 'HK',
            'Ilmu Komunikasi' => 'IKOM',
            'Psikologi' => 'PSI',
            'Pendidikan Bahasa Inggris' => 'PBI',
            'Kedokteran' => 'KED',
            'Farmasi' => 'FAR',
            'Keperawatan' => 'KEP',
        ];

        // Cek apakah ada di mapping
        if (isset($mapping[$namaProdi])) {
            return $mapping[$namaProdi];
        }

        // Jika tidak ada, ambil inisial dari kata-kata (huruf kapital pertama)
        $words = explode(' ', $namaProdi);
        $inisial = '';
        
        foreach ($words as $word) {
            if (strlen($word) > 2) { // Skip kata pendek seperti "di", "dan", dll
                $inisial .= strtoupper($word[0]);
            }
        }

        // Jika hasil kosong atau terlalu panjang, ambil 2-3 huruf pertama
        if (empty($inisial) || strlen($inisial) > 4) {
            $inisial = strtoupper(substr($namaProdi, 0, 3));
        }

        return $inisial;
    }
}
