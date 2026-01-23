<?php

namespace App\Services\CBT;

use App\Models\TestUser;

class ScoringService
{
    public static function calculate(TestUser $testUser): int
    {
        // Ambil semua jawaban user yang statusnya 'benar'
        // Eager load relasi 'question' untuk mengambil bobot nilai aslinya
        return $testUser->answers()
            ->where('is_correct', true)
            ->with('question')
            ->get()
            ->sum(function ($userAnswer) {
                // Ambil bobot dari master soal. 
                // Jika soal terhapus/null, anggap 0.
                return $userAnswer->question->score ?? 0;
            });
    }
}
