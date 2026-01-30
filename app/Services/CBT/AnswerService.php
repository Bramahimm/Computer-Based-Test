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
        ?string $answerText = null
    ): void {
        $isCorrect = null;

        // 🔥 HANYA nilai otomatis untuk PG
        if ($answerId) {
            $answer = Answer::find($answerId);
            $isCorrect = $answer?->is_correct ?? false;
        }

        UserAnswer::updateOrCreate(
            [
                'test_user_id' => $testUserId,
                'question_id'  => $questionId,
            ],
            [
                'answer_id'   => $answerId,
                'answer_text' => $answerText,
                'is_correct'  => $isCorrect,
            ]
        );
    }
}