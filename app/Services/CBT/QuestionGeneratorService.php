<?php

namespace App\Services\CBT;

use App\Models\Test;
use App\Models\Question;
use Illuminate\Support\Facades\Cache;

class QuestionGeneratorService
{
    /**
     * Generate & lock soal ujian
     */
    public static function generate(Test $test, int $userId): array
    {
        $cacheKey = self::cacheKey($test->id, $userId);

        // Jika sudah pernah generate → ambil dari cache (refresh-safe)
        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        $questionIds = [];

        // Ambil aturan per topik
        $test->load('topics');

        foreach ($test->topics as $topic) {

            $query = Question::where('topic_id', $topic->id)
                ->where('is_active', true);

            // Filter jenis soal
            if ($topic->pivot->question_type !== 'mixed') {
                $query->where('type', $topic->pivot->question_type);
            }

            // Acak atau tidak
            if ($topic->pivot->random_questions) {
                $query->inRandomOrder();
            }

            // Ambil sesuai jumlah
            $questions = $query
                ->limit($topic->pivot->total_questions)
                ->pluck('id')
                ->toArray();

            $questionIds = array_merge($questionIds, $questions);
        }

        // Kunci urutan soal final
        $payload = [
            'question_ids' => $questionIds,
            'started_at' => now(),
        ];

        // Simpan ke cache (6 jam cukup untuk durasi ujian terpanjang)
        Cache::put(
            $cacheKey,
            $payload,
            now()->addHours(6)
        );

        return $payload;
    }

    /**
     * Ambil soal + jawaban sesuai aturan
     */
    public static function getQuestions(Test $test, int $userId)
    {
        $session = self::generate($test, $userId);

        $test->load('topics');

        $questions = Question::with(['answers' => function ($q) {
            $q->whereNotNull('answer_text'); // Ambil hanya yang ada teksnya
        }])
            ->whereIn('id', $session['question_ids'])
            ->get();

        $questions = $questions->sortBy(function ($model) use ($session) {
            return array_search($model->id, $session['question_ids']);
        })->values();

        return $questions->map(function ($question) use ($test) {

            $topic = $test->topics->where('id', $question->topic_id)->first();
            if (!$topic) return $question;

            $pivot = $topic->pivot;

            // Atur jawaban PG
            if ($question->type === 'multiple_choice') {

                // 🔥 FIX: AMBIL SEMUA JAWABAN DARI DATABASE
                // Hapus logika pemisahan $correct & $wrong yang membatasi jumlah.
                // Kita ambil langsung semua relasi answers yang sudah di-load.

                $answers = $question->answers;

                // Tetap lakukan pengacakan jika fitur random aktif
                if ($pivot->random_answers) {
                    $answers = $answers->shuffle();
                }

                // Set ulang relasi dengan urutan baru (atau urutan asli DB jika tidak diacak)
                $question->setRelation('answers', $answers->values());
            }

            return $question;
        });
    }

    /**
     * Hapus cache soal (setelah submit / expired)
     */
    public static function clear(int $testId, int $userId): void
    {
        Cache::forget(self::cacheKey($testId, $userId));
    }

    /**
     * Key unik per test + user
     */
    protected static function cacheKey(int $testId, int $userId): string
    {
        return "cbt_test_{$testId}_user_{$userId}";
    }
}
