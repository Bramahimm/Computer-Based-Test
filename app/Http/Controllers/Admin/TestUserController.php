<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TestUser;
use Illuminate\Http\Request;

class TestUserController extends Controller
{
    public function index()
    {
        return inertia('Admin/TestUsers/Index', [
            'testUsers' => TestUser::with('user', 'test', 'result')
                ->latest()
                ->get(),
        ]);
    }

    public function show(TestUser $testUser)
    {
        return inertia('Admin/TestUsers/Show', [
            'testUser' => $testUser->load(
                'user',
                'test',
                'answers.question.answers',
                'result',
                'locker'
            ),
        ]);
    }

    /**
     * Lock a test user from continuing the exam
     */
    public function lock(TestUser $testUser, Request $request)
    {
        $request->validate([
            'lock_reason' => 'required|string|max:500',
        ]);

        $testUser->update([
            'is_locked' => true,
            'lock_reason' => $request->lock_reason,
            'locked_by' => auth()->id(),
            'locked_at' => now(),
        ]);

        return back()->with('success', 'Peserta berhasil dikunci!');
    }

    /**
     * Unlock a test user
     */
    public function unlock(TestUser $testUser)
    {
        $testUser->update([
            'is_locked' => false,
            'lock_reason' => null,
            'locked_by' => null,
            'locked_at' => null,
        ]);

        return back()->with('success', 'Peserta berhasil dibuka kunci!');
    }

    /**
     * Add time extension to test user exam
     */
    public function addTime(TestUser $testUser, Request $request)
    {
        $validated = $request->validate([
            'minutes' => 'required|integer|min:1|max:120',
            'reason' => 'nullable|string|max:500',
        ]);

        // If finished_at is not set, set it to now + minutes
        // If already set, add minutes to it
        $newFinishedAt = $testUser->finished_at
            ? $testUser->finished_at->addMinutes($validated['minutes'])
            : now()->addMinutes($validated['minutes']);

        $testUser->update([
            'finished_at' => $newFinishedAt,
        ]);

        return back()->with('success', "Waktu ujian ditambah {$validated['minutes']} menit!");
    }
}
