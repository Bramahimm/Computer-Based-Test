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
    Route::resource('users', UserController::class);

    // Master Data
    Route::resource('modules', ModuleController::class);
    Route::resource('topics', TopicController::class);
    Route::resource('questions', QuestionController::class);
    Route::resource('tests', TestController::class);
    Route::resource('groups', GroupController::class);

    // Import
    Route::post('/import/users', [ImportUserController::class, 'store'])
        ->name('import.users');

    Route::post('/import/questions', [ImportQuestionController::class, 'store'])
        ->name('import.questions');

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
