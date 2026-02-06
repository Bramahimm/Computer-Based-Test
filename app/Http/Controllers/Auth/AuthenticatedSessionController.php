<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Session;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request)
    {
        $request->authenticate(); 

        $request->session()->regenerate();

        /** @var \App\Models\User $user */
        $user = Auth::user();
        $user->update(['active_session_id' => session()->getId()]);

        return $user->role === 'admin'
            ? redirect()->intended(route('admin.dashboard'))
            : redirect()->intended(route('peserta.dashboard'));
    }

    public function destroy(Request $request)
    {
        $user = Auth::user();

        // 🔑 HAPUS SESSION ID SAAT LOGOUT
        if ($user) {
            $user->update(['active_session_id' => null]);
        }

        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
