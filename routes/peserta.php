<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Peserta\{
    DashboardController,
    TestController,
    ResultController
};

/*
|--------------------------------------------------------------------------
| PESERTA ROUTES (SMART ENV AWARE)
|--------------------------------------------------------------------------
*/

// Middleware wajib peserta (SELALU)
$baseMiddlewares = [
    'auth',
    'active',
    'role:peserta',
    'single.session',
];

// Middleware ujian (HANYA AKTIF DI PRODUCTION)
$examMiddlewares = app()->environment('production')
    ? [
        'seb',
        'exam.state',
        'exam.time',
        'test.access',
        'prevent.retake',
    ]
    : [];

Route::middleware($baseMiddlewares)
    ->prefix('peserta')
    ->name('peserta.')
    ->group(function () use ($examMiddlewares) {

        /* ================= DASHBOARD ================= */
        Route::get('/dashboard', [DashboardController::class, 'index'])
            ->name('dashboard');

        /* ================= DAFTAR UJIAN ================= */
        Route::get('/tests', [TestController::class, 'index'])
            ->name('tests.index');

        /* ================= HASIL UJIAN ================= */
        Route::get('/results', [ResultController::class, 'index'])
            ->name('results.index');

        Route::get('/results/{testUser}', [ResultController::class, 'show'])
            ->name('results.show');

        /*
        |--------------------------------------------------------------------------
        | MODE UJIAN (LOCKED)
        |--------------------------------------------------------------------------
        */
        Route::middleware($examMiddlewares)->group(function () {

            /* ================= MULAI UJIAN ================= */
            Route::get(
                '/tests/{test}/start',
                [TestController::class, 'start']
            )->name('tests.start');
            Route::post('/tests/{testUser}/update-progress', [TestController::class, 'updateProgress'])
                ->name('tests.update_progress');
            /* ================= AUTOSAVE ================= */
            Route::post(
                '/tests/{testUser}/answer',
                [TestController::class, 'answer']
            )->name('tests.answer');

            /* ================= SUBMIT ================= */
            Route::post(
                '/tests/{testUser}/submit',
                [TestController::class, 'submit']
            )->name('tests.submit');
        });
    });
