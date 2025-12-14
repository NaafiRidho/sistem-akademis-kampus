<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            ['name' => 'admin'],
            ['name' => 'dosen'],
            ['name' => 'mahasiswa'],
            ['name' => 'orang_tua'],
        ];

        foreach ($roles as $role) {
            Role::create($role);
        }
    }
}
