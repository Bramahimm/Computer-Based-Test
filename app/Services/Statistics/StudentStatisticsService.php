<?php

namespace App\Services\Statistics;

use App\Models\TestUser;
use Illuminate\Support\Facades\DB;

class StudentStatisticsService
{
    public static function details(int $userId): array
    {
        // Ambil semua ujian yang SUDAH diselesaikan user ini
        $history = TestUser::with(['test', 'result'])
            ->where('user_id', $userId)
            ->where('status', 'submitted')
            ->orderBy('finished_at', 'desc')
            ->get();

        // Hitung Statistik Dasar
        $totalTests = $history->count();
        $scores = $history->pluck('result.total_score')->filter(); // Ambil array nilai

        $stats = [
            'total_tests' => $totalTests,
            'average_score' => $totalTests > 0 ? round($scores->avg(), 1) : 0,
            'highest_score' => $totalTests > 0 ? $scores->max() : 0,
            'lowest_score' => $totalTests > 0 ? $scores->min() : 0,
            'passed_tests' => $history->where('result.total_score', '>=', 76)->count(),
        ];

        // Data untuk Grafik (5 Ujian Terakhir)
        $chartData = $history->take(10)->reverse()->values()->map(function ($item) {
            return [
                'test_title' => $item->test->title,
                'score' => $item->result->total_score ?? 0,
                'date' => $item->finished_at->format('d M'),
            ];
        });

        // Data Tabel Histori
        $historyData = $history->map(function ($item) {
            return [
                'id' => $item->id,
                'test_title' => $item->test->title,
                'finished_at' => $item->finished_at->format('d F Y H:i'),
                'score' => $item->result->total_score ?? 0,
                'status' => $item->result->total_score >= 76 ? 'Lulus' : 'Tidak Lulus',
            ];
        });

        return [
            'stats' => $stats,
            'chart' => $chartData,
            'history' => $historyData,
        ];
    }
}
