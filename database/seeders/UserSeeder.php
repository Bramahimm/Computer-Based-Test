<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Hapus semua user lama
        User::truncate();

        // ADMIN 1
        User::create([
            'name' => 'Penda Wardani',
            'npm' => null,
            'email' => 'penda@fk.unila.ac.id',
            'password' => Hash::make('penda@123'),
            'role' => 'admin',
            'is_active' => true,
        ]);

        // ADMIN 2
        User::create([
            'name' => 'Nahrowi',
            'npm' => null,
            'email' => 'nahrowi@fk.unila.ac.id',
            'password' => Hash::make('nahrowi@123'),
            'role' => 'admin',
            'is_active' => true,
        ]);
    }
}
