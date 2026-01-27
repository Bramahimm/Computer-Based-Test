<?php

namespace App\Http\Controllers\Peserta;

use App\Http\Controllers\Controller;
use App\Http\Requests\Peserta\SaveAnswerRequest;
use App\Models\Test;
use App\Models\TestUser;
use App\Services\CBT\AnswerService;
use App\Services\CBT\ExamStateService;
use App\Services\CBT\ExamTimeService;
use App\Services\CBT\QuestionGeneratorService;
use App\Services\CBT\ScoringService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request; // 🔥 Tambahkan ini untuk handle request update progress

class TestController extends Controller
{
    /**
     * List ujian dengan Sorting Prioritas
     */
    public function index()
    {
        $user = Auth::user();

        $tests = Test::whereHas('groups', function ($q) use ($user) {
            $q->whereIn('groups.id', $user->groups->pluck('id'));
        })
            ->where('is_active', true)
            ->get()
            ->map(function ($test) use ($user) {
                $testUser = TestUser::where('test_id', $test->id)
                    ->where('user_id', $user->id)
                    ->first();

                $now = now();
                $status = 'KERJAKAN';
                $priority = 2;

                // 1. Cek Status Spesifik User
                if ($testUser) {
                    if ($testUser->status == 'submitted') {
                        $status = 'SELESAI';
                        $priority = 4;
                    } elseif ($testUser->status == 'expired') {
                        $status = 'KADALUARSA';
                        $priority = 5;
                    } elseif ($testUser->status == 'ongoing') {
                        if ($now > $test->end_time) {
                            $status = 'KADALUARSA';
                            $priority = 5;
                        } else {
                            $status = 'LANJUTKAN';
                            $priority = 1;
                        }
                    }
                }
                // 2. Cek Status Global
                else {
                    if ($now < $test->start_time) {
                        $status = 'BELUM_MULAI';
                        $priority = 3;
                    } elseif ($now > $test->end_time) {
                        $status = 'KADALUARSA';
                        $priority = 5;
                    } else {
                        $status = 'KERJAKAN';
                        $priority = 2;
                    }
                }

                $test->user_status = $status;
                $test->sort_priority = $priority;
                return $test;
            })
            ->sortBy([
                ['sort_priority', 'asc'],
                ['start_time', 'desc'],
            ])
            ->values();

        return inertia('Peserta/Tests/Index', compact('tests'));
    }

    /**
     * Mulai ujian
     */
    public function start(Test $test)
    {
        $user = Auth::user();

        // Cek Waktu Global
        if (now() > $test->end_time) {
            return redirect()->route('peserta.tests.index')->withErrors('Waktu habis.');
        }

        // Create or Get Session
        $testUser = TestUser::firstOrCreate(
            ['test_id' => $test->id, 'user_id' => $user->id],
            ['started_at' => now(), 'status' => 'ongoing']
        );

        if (is_null($testUser->started_at)) {
            $testUser->update(['started_at' => now(), 'status' => 'ongoing']);
        }

        // 🔥 UPDATE ACTIVITY: Catat bahwa user sedang aktif sekarang
        $testUser->update(['last_activity_at' => now()]);

        // Cek Expired
        ExamStateService::autoExpire($testUser);
        if ($testUser->status === 'expired' || $testUser->status === 'submitted') {
            return redirect()->route('peserta.dashboard')->withErrors('Akses ditutup.');
        }

        // Ambil Soal
        $questions = QuestionGeneratorService::getQuestions($test, $user->id);

        // Ambil Jawaban Existing
        $existingAnswers = $testUser->answers()
            ->select('question_id', 'answer_id', 'answer_text')
            ->get()
            ->mapWithKeys(function ($ans) {
                return [
                    $ans->question_id => [
                        'answerId' => $ans->answer_id,
                        'answerText' => $ans->answer_text
                    ]
                ];
            });

        return inertia('Peserta/Tests/Start', [
            'test' => $test,
            'testUserId' => $testUser->id,
            'questions' => $questions,
            'remainingSeconds' => ExamTimeService::remainingSeconds($testUser),
            'existingAnswers' => $existingAnswers,
            'currentUser' => $user,

            // 🔥 DATA POSISI SOAL: Dikirim ke Frontend agar bisa resume
            'lastIndex' => $testUser->current_index ?? 0,
        ]);
    }

    /**
     * 🔥 NEW: Update Progress (Posisi Soal)
     * Dipanggil via Axios saat user klik Next/Prev
     */
    public function updateProgress(Request $request, TestUser $testUser)
    {
        // Security Check: Pastikan user yang login adalah pemilik ujian ini
        if ($testUser->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'index' => 'required|integer|min:0',
            'question_id' => 'nullable|exists:questions,id'
        ]);

        // Update tracking columns di tabel test_users
        $testUser->update([
            'current_index' => $validated['index'],
            'last_question_id' => $validated['question_id'] ?? null,
            'last_activity_at' => now() // Update timestamp aktivitas
        ]);

        return response()->json(['status' => 'saved']);
    }

    /**
     * Simpan Jawaban
     */
    public function answer(SaveAnswerRequest $request, TestUser $testUser)
    {
        ExamStateService::autoExpire($testUser);

        if ($testUser->status === 'expired') {
            return response()->json(['status' => 'expired'], 403);
        }

        $data = $request->validated();

        AnswerService::save(
            $testUser->id,
            $data['question_id'],
            $data['answer_id'] ?? null,
            $data['answer_text'] ?? null
        );

        // 🔥 UPDATE ACTIVITY JUGA SAAT MENJAWAB
        $testUser->update(['last_activity_at' => now()]);

        return response()->json(['status' => 'saved']);
    }

    /**
     * Selesai Ujian
     */
    public function submit(TestUser $testUser)
    {
        $testUser->update([
            'status' => 'submitted',
            'finished_at' => now()
        ]);

        $totalScore = ScoringService::calculate($testUser);

        $testUser->result()->create([
            'total_score' => $totalScore,
            'status' => 'pending'
        ]);

        QuestionGeneratorService::clear($testUser->test_id, $testUser->user_id);

        return redirect()->route('peserta.dashboard')->with('success', 'Ujian berhasil diselesaikan.');
    }
}
