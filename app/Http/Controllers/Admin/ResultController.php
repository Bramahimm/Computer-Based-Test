<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TestUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ResultController extends Controller
{
    public function index()
    {
        return inertia('Admin/Results/Index', [
            'results' => TestUser::with('user', 'test', 'result')
                ->whereHas('result')
                ->get()
        ]);
    }

    public function validateResult(Request $request, TestUser $testUser)
{
    // Pastikan result ada
    if (!$testUser->result) {
        abort(404);
    }

    // Gunakan nilai otomatis dari sistem
    $testUser->result->update([
        'status' => 'validated',
        'validated_by' => Auth::id(),
        'validated_at' => now(),
    ]);

    // Tetap di halaman results
    return Inertia::location(route('admin.tests.index', [
        'section' => 'results'
    ]));
}

}
