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

        // 🔥 PERBAIKAN 1: UNCOMMENT CACHE
        // Ini wajib aktif agar saat user refresh, sistem tidak mengacak ulang soal.
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

        // Urutkan soal kembali sesuai urutan di session cache
        $questions = $questions->sortBy(function ($model) use ($session) {
            return array_search($model->id, $session['question_ids']);
        })->values();

        return $questions->map(function ($question) use ($test, $userId) {

            $topic = $test->topics->where('id', $question->topic_id)->first();
            if (!$topic) return $question;

            $pivot = $topic->pivot;

            // Atur jawaban PG
            if ($question->type === 'multiple_choice') {

                $answers = $question->answers;

                // Tetap lakukan pengacakan jika fitur random aktif
                if ($pivot->random_answers) {
                    // 🔥 PERBAIKAN 2: DETERMINISTIC SHUFFLE
                    // Jangan pakai shuffle() biasa karena akan berubah tiap refresh.
                    // Gunakan sorting berdasarkan Hash ID Jawaban + ID User.
                    // Hasilnya: Acak berbeda tiap user, tapi KONSISTEN (tetap) untuk user tersebut.
                    $answers = $answers->sortBy(function ($ans) use ($userId) {
                        return md5($ans->id . '_' . $userId);
                    })->values();
                }

                // Set ulang relasi dengan urutan baru
                $question->setRelation('answers', $answers);
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
