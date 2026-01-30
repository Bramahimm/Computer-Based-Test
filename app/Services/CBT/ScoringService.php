<?php

namespace App\Services\CBT;

use App\Models\TestUser;

class ScoringService
{
    /**
     * Hitung nilai ujian secara ON-THE-FLY
     * - 1 test = 1 topic
     * - Hanya soal PG (multiple_choice)
     * - Essay diabaikan
     * - Nilai = persentase jawaban benar
     */
    public static function calculate(TestUser $testUser): int
    {
        // Pastikan relasi test & topic ada
        $test = $testUser->test;

        if (!$test) {
            return 0;
        }

        // Ambil 1 topic dari test (sesuai aturan bisnis)
        $topic = $test->topics()->first();

        if (!$topic) {
            return 0;
        }

        /**
         * TOTAL SOAL PG dalam topic
         */
        $totalQuestions = $topic->questions()
            ->where('type', 'multiple_choice')
            ->where('is_active', true)
            ->count();

        if ($totalQuestions === 0) {
            return 0;
        }

        /**
         * TOTAL JAWABAN BENAR USER (PG SAJA)
         */
        $correctAnswers = $testUser->answers()
            ->where('is_correct', true)
            ->whereHas('question', function ($q) {
                $q->where('type', 'multiple_choice');
            })
            ->count();

        /**
         * HITUNG NILAI (PERSENTASE)
         */
        $score = ($correctAnswers / $totalQuestions) * 100;

        return (int) round($score);
    }
}
