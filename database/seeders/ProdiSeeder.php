<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Prodi;
use App\Models\Fakultas;

class ProdiSeeder extends Seeder
{
    public function run(): void
    {
        $prodiData = [
            'Fakultas Teknik' => [
                'Teknik Sipil',
                'Teknik Mesin',
                'Teknik Elektro',
                'Teknik Industri',
            ],
            'Fakultas Ekonomi dan Bisnis' => [
                'Manajemen',
                'Akuntansi',
                'Ekonomi Pembangunan',
            ],
            'Fakultas Ilmu Komputer' => [
                'Teknik Informatika',
                'Sistem Informasi',
                'Teknologi Informasi',
            ],
            'Fakultas Kedokteran' => [
                'Pendidikan Dokter',
                'Keperawatan',
                'Farmasi',
            ],
            'Fakultas Hukum' => [
                'Ilmu Hukum',
            ],
            'Fakultas Ilmu Sosial dan Politik' => [
                'Ilmu Komunikasi',
                'Administrasi Publik',
                'Hubungan Internasional',
            ],
            'Fakultas Pertanian' => [
                'Agroteknologi',
                'Agribisnis',
            ],
        ];

        foreach ($prodiData as $fakultasNama => $prodiList) {
            $fakultas = Fakultas::where('nama_fakultas', $fakultasNama)->first();
            
            if ($fakultas) {
                foreach ($prodiList as $prodiNama) {
                    Prodi::create([
                        'fakultas_id' => $fakultas->id,
                        'nama_prodi' => $prodiNama,
                    ]);
                }
            }
        }
    }
}
