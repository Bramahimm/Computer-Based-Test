<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            GroupSeeder::class,
            UserSeeder::class,
            ModuleSeeder::class,
            TopicSeeder::class,
            QuestionSeeder::class,
            TestSeeder::class,
        ]);
    }
}
