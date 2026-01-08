<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Mahasiswa;
use App\Models\User;
use App\Models\Role;
use App\Models\Prodi;
use App\Models\Kelas;

class MahasiswaSeeder extends Seeder
{
    public function run(): void
    {
        $mahasiswaRole = Role::where('name', 'mahasiswa')->first();
        $mahasiswaUsers = User::where('role_id', $mahasiswaRole->id)->get();
        $prodiList = Prodi::all();

        $angkatanList = [2021, 2022, 2023, 2024];
        $jenisKelaminList = ['L', 'P'];

        foreach ($mahasiswaUsers as $index => $user) {
            $angkatan = $angkatanList[array_rand($angkatanList)];
            $prodi = $prodiList->random();
            $nim = $angkatan . str_pad(($index + 1), 6, '0', STR_PAD_LEFT);
            
            // Cari kelas yang sesuai dengan prodi
            $kelas = Kelas::where('prodi_id', $prodi->id)->inRandomOrder()->first();
            
            Mahasiswa::create([
                'user_id' => $user->id,
                'nim' => $nim,
                'nama' => $user->name,
                'prodi_id' => $prodi->id,
                'kelas_id' => $kelas ? $kelas->id : null,
                'angkatan' => $angkatan,
                'jenis_kelamin' => $jenisKelaminList[array_rand($jenisKelaminList)],
                'alamat' => 'Jl. Contoh No. ' . ($index + 1) . ', Jakarta',
            ]);
        }
    }
}
