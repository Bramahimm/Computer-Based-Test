<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\{
    DashboardController as AdminDashboardController,
    ModuleController,
    TopicController,
    QuestionController,
    TestController,
    ResultController,
    MonitoringController,
    ForceSubmitController,
    ImportUserController,
    ImportQuestionController,
    UserController,
    GroupController
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

    // 2. Import Questions (PINDAHKAN KE SINI - SEBELUM RESOURCE)
    Route::get('/questions/import', [ImportQuestionController::class, 'create'])->name('questions.import.view');
    Route::post('/import/questions', [ImportQuestionController::class, 'store'])->name('import.questions');
    Route::get('/questions/import/template', [ImportQuestionController::class, 'downloadTemplate'])->name('questions.import.template');


    // =========================================================
    // ROUTE RESOURCE (DITARUH DI BAWAHNYA)
    // =========================================================

    Route::resource('users', UserController::class);
    Route::resource('modules', ModuleController::class);
    Route::resource('topics', TopicController::class);

    // Route resource questions AMAN ditaruh di sini karena route import sudah didefinisikan duluan di atas
    Route::resource('questions', QuestionController::class);

    Route::resource('tests', TestController::class);
    Route::resource('groups', GroupController::class);


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
});
