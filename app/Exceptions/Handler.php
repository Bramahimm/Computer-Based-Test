<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;
use Inertia\Inertia;
use Illuminate\Support\Facades\App;

class Handler extends ExceptionHandler
{
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    public function register()
    {
        $this->renderable(function (Throwable $e, $request) {
            if ($request->header('X-Inertia')) {
                // Handle Session Expired (419)
                if ($e instanceof \Illuminate\Session\TokenMismatchException) {
                    return redirect()->route('login')->with('error', 'Sesi Anda telah berakhir, silakan login kembali.');
                }
            }
        });
    }

    public function render($request, Throwable $e)
    {
        $response = parent::render($request, $e);

        // Daftar status yang ingin ditampilkan menggunakan halaman DynamicError
        $errorStatuses = [500, 503, 404, 403, 419];

        if (in_array($response->status(), $errorStatuses)) {
            return Inertia::render('Errors/DynamicError', [
                'status' => $response->status(),
                // 🔥 Menangkap pesan kustom dari middleware (abort)
                'message' => $e->getMessage() ?: null,
            ])->toResponse($request)->setStatusCode($response->status());
        }

        return $response;
    }
}
