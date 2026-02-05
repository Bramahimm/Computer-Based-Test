<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| AUTH
|--------------------------------------------------------------------------
*/

Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthenticatedSessionController::class, 'create'])
        ->name('login');

    Route::post('/login', [AuthenticatedSessionController::class, 'store']);
});

Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth')
    ->name('logout');

/*
|--------------------------------------------------------------------------
| ROOT (SMART REDIRECT – ANTI LOOP)
|--------------------------------------------------------------------------
*/
Route::get('/', function () {
    // 1. Jika user sudah login, arahkan ke dashboard masing-masing
    if (auth()->check()) {
        return auth()->user()->role === 'admin'
            ? Inertia::location(route('admin.dashboard'))
            : Inertia::location(route('peserta.dashboard'));
    }

    // 2. Jika user BELUM login, tampilkan halaman Welcome.jsx
    return Inertia::render('Welcome');
});
