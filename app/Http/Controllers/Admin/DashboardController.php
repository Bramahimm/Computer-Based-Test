<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Test;
use App\Models\TestUser;
use App\Models\Result;

class DashboardController extends Controller
{
    public function index()
    {
        return inertia('Admin/Dashboard', [
            'stats' => [
                'totalUsers'   => User::where('role', 'peserta')->count(),
                'totalTests'   => Test::count(),
                'activeTests'  => Test::where('is_active', true)->count(),
                'ongoingTests' => TestUser::where('status', 'ongoing')->count(),
            ],
            'latestTests' => Test::latest()->limit(5)->get(['id', 'title', 'start_time', 'end_time']),
        ]);
    }
}
