<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Group;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // ADMIN
        User::create([
            'name' => 'Admin CBT',
            'email' => 'admin@fk.unila.ac.id',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'is_active' => true,
        ]);

        // PESERTA
        $peserta = User::create([
            'name' => 'Peserta Ujian',
            'email' => 'peserta@fk.unila.ac.id',
            'password' => Hash::make('password'),
            'role' => 'peserta',
            'is_active' => true,
        ]);

        // Assign ke group (angkatan)
        $group = Group::where('name', 'Angkatan 2025')->first();
        $peserta->groups()->attach($group->id);
    }
}
