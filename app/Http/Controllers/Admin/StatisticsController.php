<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Test;
use App\Models\User;
use App\Services\Statistics\TestStatisticsService;
use App\Services\Statistics\StudentStatisticsService;
use Illuminate\Http\Request;

class StatisticsController extends Controller
{
    /**
     * Menampilkan halaman statistik per ujian
     * (Chart, Distribusi Nilai, Top Student, & Analisis Butir Soal)
     * Route: admin.statistics.test
     */
    public function test(Test $test)
    {
        $summaryData = TestStatisticsService::summary($test->id);

        // Render ke: resources/js/Pages/Admin/Tests/Statistics.jsx
        return inertia('Admin/Tests/Statistics', [
            'test' => $test,
            'summary' => $summaryData,
        ]);
    }

    /**
     * Menampilkan halaman statistik per siswa
     * (Riwayat Ujian, Grafik Perkembangan, Statistik Personal)
     * Route: admin.statistics.student
     */
    public function student(User $user)
    {
        $user->load('groups');

        // Render ke: resources/js/Pages/Admin/Statistics/Student.jsx
        return inertia('Admin/Statistics/Student', [
            'student' => $user,
            'data' => StudentStatisticsService::details($user->id),
        ]);
    }
}
