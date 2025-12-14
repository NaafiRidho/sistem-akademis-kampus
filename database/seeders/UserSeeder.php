<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Role::where('name', 'admin')->first();
        $dosenRole = Role::where('name', 'dosen')->first();
        $mahasiswaRole = Role::where('name', 'mahasiswa')->first();

        // Admin Users
        User::create([
            'name' => 'Admin Utama',
            'email' => 'admin@kampus.ac.id',
            'password' => Hash::make('password'),
            'role_id' => $adminRole->id,
            'status' => 'active',
        ]);

        // Dosen Users (20 dosen)
        for ($i = 1; $i <= 20; $i++) {
            User::create([
                'name' => 'Dosen ' . $i,
                'email' => 'dosen' . $i . '@kampus.ac.id',
                'password' => Hash::make('password'),
                'role_id' => $dosenRole->id,
                'status' => 'active',
            ]);
        }

        // Mahasiswa Users (50 mahasiswa)
        for ($i = 1; $i <= 50; $i++) {
            User::create([
                'name' => 'Mahasiswa ' . $i,
                'email' => 'mahasiswa' . $i . '@kampus.ac.id',
                'password' => Hash::make('password'),
                'role_id' => $mahasiswaRole->id,
                'status' => 'active',
            ]);
        }
    }
}
