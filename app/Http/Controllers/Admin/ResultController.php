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
                ->latest()
                ->paginate(10)
        ]);
    }
}
