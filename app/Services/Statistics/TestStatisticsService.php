<?php

namespace App\Services\Statistics;

use App\Models\TestUser;
use App\Models\Question;
use Illuminate\Support\Facades\DB;

class TestStatisticsService
{
    public static function summary(int $testId): array
    {
        // 1. Ambil data global (Stats & Chart)
        $results = TestUser::with(['result', 'user'])
            ->where('test_id', $testId)
            ->where('status', 'submitted')
            ->get();

        $totalParticipants = $results->count();
        $scores = $results->pluck('result.total_score')->filter();

        // Stats Global
        $stats = [
            'total_participants' => $totalParticipants,
            'average_score' => $totalParticipants > 0 ? round($scores->avg(), 1) : 0,
            'highest_score' => $totalParticipants > 0 ? $scores->max() : 0,
            'lowest_score' => $totalParticipants > 0 ? $scores->min() : 0,
            'passed_count' => $results->where('result.total_score', '>=', 75)->count(),
            'failed_count' => $results->where('result.total_score', '<', 75)->count(),
        ];

        // Distribusi Chart
        $distribution = [
            '0-20' => $results->whereBetween('result.total_score', [0, 20])->count(),
            '21-40' => $results->whereBetween('result.total_score', [21, 40])->count(),
            '41-60' => $results->whereBetween('result.total_score', [41, 60])->count(),
            '61-80' => $results->whereBetween('result.total_score', [61, 80])->count(),
            '81-100' => $results->whereBetween('result.total_score', [81, 100])->count(),
        ];

        // Top Students
        $topStudents = $results->sortByDesc('result.total_score')->take(5)->map(function ($item) {
            return [
                'name' => $item->user->name ?? 'Unknown',
                'score' => $item->result->total_score,
                'finished_at' => $item->finished_at ? $item->finished_at->diffForHumans() : '-',
            ];
        })->values();

        // -----------------------------------------------------------
        // 🔥 LOGIKA BARU: Analisis Butir Soal (Per Question)
        // -----------------------------------------------------------

        // Ambil semua soal untuk test ini beserta jawaban user
        $questions = Question::with(['answers'])
            ->whereHas('topic.tests', function ($q) use ($testId) {
                $q->where('tests.id', $testId);
            })
            ->get();

        // Ambil SEMUA jawaban user untuk test ini
        $allUserAnswers = DB::table('user_answers')
            ->join('test_users', 'user_answers.test_user_id', '=', 'test_users.id')
            ->where('test_users.test_id', $testId)
            ->where('test_users.status', 'submitted')
            ->select('user_answers.question_id', 'user_answers.answer_id', 'user_answers.is_correct')
            ->get();

        $questionAnalysis = $questions->map(function ($q) use ($allUserAnswers, $totalParticipants) {
            $responses = $allUserAnswers->where('question_id', $q->id);

            $correctCount = $responses->where('is_correct', 1)->count();
            $wrongCount = $responses->where('is_correct', 0)->whereNotNull('answer_id')->count();
            $unansweredCount = $totalParticipants - ($correctCount + $wrongCount);

            $answersStats = $q->answers->map(function ($ans) use ($responses, $totalParticipants) {
                $count = $responses->where('answer_id', $ans->id)->count();
                return [
                    'answer_text' => $ans->answer_text,
                    'is_correct' => $ans->is_correct,
                    'selection_count' => $count,
                    'selection_pct' => $totalParticipants > 0 ? round(($count / $totalParticipants) * 100, 1) : 0,
                ];
            });

            return [
                'id' => $q->id,
                'question_text' => $q->question_text,
                'stats' => [
                    'recurrence' => $totalParticipants,
                    'correct' => $correctCount,
                    'correct_pct' => $totalParticipants > 0 ? round(($correctCount / $totalParticipants) * 100, 1) : 0,
                    'wrong' => $wrongCount,
                    'wrong_pct' => $totalParticipants > 0 ? round(($wrongCount / $totalParticipants) * 100, 1) : 0,
                    'unanswered' => $unansweredCount,
                    'unanswered_pct' => $totalParticipants > 0 ? round(($unansweredCount / $totalParticipants) * 100, 1) : 0,
                ],
                'answers' => $answersStats
            ];
        });

        return [
            'stats' => $stats,
            'distribution' => $distribution,
            'top_students' => $topStudents,
            'questions' => $questionAnalysis,
        ];
    }
}
