<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class ActivityLogger {
    public function handle(Request $request, Closure $next): Response {
        if (Auth::check()) {
            // kunci cache unik per user
            $key = 'user-online-' . Auth::id();
            // disini untuk menyimpan hasil request data dan disimpan dalam 5 menit (300detik)
            Cache::put($key, [
                'ip' => $request->ip(),
                'last_activity' => now(),
                'role' => Auth::user()->role,
                'name' => Auth::user()->name,
                'npm' => Auth::user()->npm ?? '-',
            ], 300);
        }

        return $next($request);
    }
}
