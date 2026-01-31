<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\{
    DashboardController as AdminDashboardController,
    ModuleController,
    TopicController,
    QuestionController,
    TestController,
    TestUserController,
    ResultController,
    MonitoringController,
    ForceSubmitController,
    ImportUserController,
    ImportQuestionController,
    UserController,
    GroupController,
    StatisticsController // 🔥 1. IMPORT CONTROLLER INI
};

Route::middleware([
    'auth',
    'active',
    'role:admin',
])->prefix('admin')->name('admin.')->group(function () {

    // Dashboard
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])
        ->name('dashboard');

    // =========================================================
    // 🔥 ROUTE IMPORT (WAJIB DITARUH PALING ATAS) 🔥
    // =========================================================

    // 1. Import Users
    Route::get('/users/import', [ImportUserController::class, 'create'])->name('users.import.view');
    Route::post('/import/users', [ImportUserController::class, 'store'])->name('import.users');
    Route::get('/users/import/template', [ImportUserController::class, 'downloadTemplate'])->name('import.template');

    // 2. Import Questions
    Route::get('/questions/import', [ImportQuestionController::class, 'create'])->name('questions.import.view');
    Route::post('/import/questions', [ImportQuestionController::class, 'store'])->name('import.questions');
    Route::get('/questions/import/template', [ImportQuestionController::class, 'downloadTemplate'])->name('questions.import.template');


    // =========================================================
    // ROUTE RESOURCE
    // =========================================================

    Route::resource('users', UserController::class);
    Route::resource('modules', ModuleController::class);
    Route::resource('topics', TopicController::class);

    // Route resource questions AMAN ditaruh di sini karena route import sudah didefinisikan duluan di atas
    Route::resource('questions', QuestionController::class);

    Route::resource('tests', TestController::class);
    Route::resource('groups', GroupController::class);
    Route::resource('test-users', TestUserController::class)->only(['show']);

    // Lock/Unlock Test Users
    Route::post('/test-users/{testUser}/lock', [TestUserController::class, 'lock'])
        ->name('test-users.lock');
    Route::post('/test-users/{testUser}/unlock', [TestUserController::class, 'unlock'])
        ->name('test-users.unlock');
    Route::post('/test-users/{testUser}/add-time', [TestUserController::class, 'addTime'])
        ->name('test-users.addTime');


    // =========================================================
    // HASIL & MONITORING
    // =========================================================

    // Result & Validation
    Route::get('/results', [ResultController::class, 'index'])
        ->name('results.index');

    Route::post('/results/{testUser}/validate', [ResultController::class, 'validateResult'])
        ->name('results.validate');

    // Monitoring Hari-H
    Route::get('/monitoring/tests/{test}', [MonitoringController::class, 'index'])
        ->name('monitoring.index');

    Route::post(
        '/monitoring/test-users/{testUser}/force-submit',
        [ForceSubmitController::class, 'submit']
    )->name('monitoring.forceSubmit');

    // =========================================================
    // 🔥 STATISTICS / STATISTIK (BARU) 🔥
    // =========================================================

    // Statistik per Ujian (Untuk Admin melihat performa soal/peserta dalam 1 ujian)
    // URL: /admin/statistics/tests/{id_test}
    Route::get('/statistics/tests/{test}', [StatisticsController::class, 'test'])
        ->name('statistics.test');

    // Statistik per Siswa (Untuk melihat riwayat nilai spesifik user)
    // URL: /admin/statistics/students/{id_user}
    Route::get('/statistics/students/{user}', [StatisticsController::class, 'student'])
        ->name('statistics.student');
});
