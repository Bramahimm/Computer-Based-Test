<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use karbon\Carbon;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/api/time', function () {
    return response()->json(['server_time' => now()->toIso8601String()]);
});
