<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Group;

class GroupSeeder extends Seeder
{
    public function run(): void
    {
        Group::create([
            'name' => 'Angkatan 2024',
        ]);

        Group::create([
            'name' => 'Angkatan 2025',
        ]);
    }
}
