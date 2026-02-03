<?php

namespace App\Services\CBT;

use App\Models\UserAnswer;
use App\Models\Answer;
use App\Models\Question;

class AnswerService
{
    public static function save(
        int $testUserId,
        int $questionId,
        ?int $answerId = null,
        ?string $answerText = null,
        ?bool $isCorrect = null,
        ?int $score = 0
    ): void {

        // Logika Backup: Jika Controller lupa kirim status, kita cari manual dari DB
        if ($isCorrect === null && $answerId) {
            $answer = Answer::find($answerId);
            $isCorrect = $answer?->is_correct ?? false;
        }

        // Simpan ke Database
        UserAnswer::updateOrCreate(
            [
                // Kriteria Pencarian (WHERE)
                'test_user_id' => $testUserId,
                'question_id'  => $questionId,
            ],
            [
                // Data yang diupdate/disimpan
                'answer_id'   => $answerId,
                'answer_text' => $answerText,
                'is_correct'  => $isCorrect,
                'score'       => $score,
            ]
        );
    }
}
