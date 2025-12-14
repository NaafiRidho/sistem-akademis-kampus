<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Dosen;
use App\Models\User;
use App\Models\Role;

class DosenSeeder extends Seeder
{
    public function run(): void
    {
        $dosenRole = Role::where('name', 'dosen')->first();
        $dosenUsers = User::where('role_id', $dosenRole->id)->get();

        foreach ($dosenUsers as $index => $user) {
            $nidn = '0' . str_pad(($index + 1), 9, '0', STR_PAD_LEFT);
            
            Dosen::create([
                'user_id' => $user->id,
                'nidn' => $nidn,
                'nama' => $user->name,
                'email' => $user->email,
            ]);
        }
    }
}
