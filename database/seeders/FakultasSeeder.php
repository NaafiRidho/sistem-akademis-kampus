<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Fakultas;

class FakultasSeeder extends Seeder
{
    public function run(): void
    {
        $fakultas = [
            ['nama_fakultas' => 'Fakultas Teknik'],
            ['nama_fakultas' => 'Fakultas Ekonomi dan Bisnis'],
            ['nama_fakultas' => 'Fakultas Ilmu Komputer'],
            ['nama_fakultas' => 'Fakultas Kedokteran'],
            ['nama_fakultas' => 'Fakultas Hukum'],
            ['nama_fakultas' => 'Fakultas Ilmu Sosial dan Politik'],
            ['nama_fakultas' => 'Fakultas Pertanian'],
        ];

        foreach ($fakultas as $f) {
            Fakultas::create($f);
        }
    }
}
