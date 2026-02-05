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
    // ... bagian atas tetap sama

    public function store(LoginRequest $request)
    {
        $request->authenticate();
        $request->session()->regenerate();

        $user = auth()->user();
        $currentSessionId = session()->getId();

        // 🔑 DAFTARKAN SESSION ID BARU SAAT LOGIN
        // Jika Admin, kita biarkan saja (Admin boleh login di banyak tempat)
        if ($user->role !== 'admin') {
            $user->update([
                'active_session_id' => $currentSessionId
            ]);
        }

        if ($user->role === 'admin') {
            return Inertia::location(route('admin.dashboard'));
        }

        return Inertia::location(route('peserta.dashboard'));
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
