<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\MataKuliah;
use App\Models\Prodi;

class MataKuliahSeeder extends Seeder
{
    public function run(): void
    {
        $prodi = Prodi::all();

        $mataKuliahData = [
            // Teknik Informatika
            ['kode' => 'TIF101', 'nama' => 'Pemrograman Dasar', 'sks' => 3],
            ['kode' => 'TIF102', 'nama' => 'Struktur Data', 'sks' => 3],
            ['kode' => 'TIF103', 'nama' => 'Basis Data', 'sks' => 3],
            ['kode' => 'TIF104', 'nama' => 'Algoritma dan Pemrograman', 'sks' => 4],
            ['kode' => 'TIF105', 'nama' => 'Pemrograman Web', 'sks' => 3],
            ['kode' => 'TIF106', 'nama' => 'Pemrograman Mobile', 'sks' => 3],
            ['kode' => 'TIF107', 'nama' => 'Kecerdasan Buatan', 'sks' => 3],
            ['kode' => 'TIF108', 'nama' => 'Sistem Operasi', 'sks' => 3],
            ['kode' => 'TIF109', 'nama' => 'Jaringan Komputer', 'sks' => 3],
            ['kode' => 'TIF110', 'nama' => 'Rekayasa Perangkat Lunak', 'sks' => 3],
            
            // Teknik Sipil
            ['kode' => 'TS101', 'nama' => 'Mekanika Teknik', 'sks' => 3],
            ['kode' => 'TS102', 'nama' => 'Struktur Beton', 'sks' => 3],
            ['kode' => 'TS103', 'nama' => 'Struktur Baja', 'sks' => 3],
            ['kode' => 'TS104', 'nama' => 'Teknik Jalan Raya', 'sks' => 3],
            ['kode' => 'TS105', 'nama' => 'Hidrologi', 'sks' => 3],
            
            // Teknik Elektro
            ['kode' => 'TE101', 'nama' => 'Rangkaian Listrik', 'sks' => 3],
            ['kode' => 'TE102', 'nama' => 'Elektronika Dasar', 'sks' => 3],
            ['kode' => 'TE103', 'nama' => 'Sistem Digital', 'sks' => 3],
            ['kode' => 'TE104', 'nama' => 'Mikroprosesor', 'sks' => 3],
            ['kode' => 'TE105', 'nama' => 'Sistem Kontrol', 'sks' => 3],
            
            // Akuntansi
            ['kode' => 'AK101', 'nama' => 'Pengantar Akuntansi', 'sks' => 3],
            ['kode' => 'AK102', 'nama' => 'Akuntansi Keuangan', 'sks' => 3],
            ['kode' => 'AK103', 'nama' => 'Akuntansi Biaya', 'sks' => 3],
            ['kode' => 'AK104', 'nama' => 'Auditing', 'sks' => 3],
            ['kode' => 'AK105', 'nama' => 'Perpajakan', 'sks' => 3],
            
            // Manajemen
            ['kode' => 'MJ101', 'nama' => 'Pengantar Manajemen', 'sks' => 3],
            ['kode' => 'MJ102', 'nama' => 'Manajemen Sumber Daya Manusia', 'sks' => 3],
            ['kode' => 'MJ103', 'nama' => 'Manajemen Pemasaran', 'sks' => 3],
            ['kode' => 'MJ104', 'nama' => 'Manajemen Keuangan', 'sks' => 3],
            ['kode' => 'MJ105', 'nama' => 'Manajemen Operasional', 'sks' => 3],
        ];

        $created = 0;
        foreach ($prodi as $p) {
            // Ambil mata kuliah berdasarkan kode prodi
            $prefix = '';
            if (str_contains($p->nama_prodi, 'Informatika')) {
                $prefix = 'TIF';
            } elseif (str_contains($p->nama_prodi, 'Sipil')) {
                $prefix = 'TS';
            } elseif (str_contains($p->nama_prodi, 'Elektro')) {
                $prefix = 'TE';
            } elseif (str_contains($p->nama_prodi, 'Akuntansi')) {
                $prefix = 'AK';
            } elseif (str_contains($p->nama_prodi, 'Manajemen')) {
                $prefix = 'MJ';
            }

            if ($prefix) {
                $relevantMK = array_filter($mataKuliahData, function($mk) use ($prefix) {
                    return str_starts_with($mk['kode'], $prefix);
                });

                foreach ($relevantMK as $mk) {
                    MataKuliah::create([
                        'kode_mk' => $mk['kode'],
                        'nama_mk' => $mk['nama'],
                        'sks' => $mk['sks'],
                        'prodi_id' => $p->id
                    ]);
                    $created++;
                }
            }
        }

        echo "✓ Berhasil membuat {$created} mata kuliah\n";
    }
}
