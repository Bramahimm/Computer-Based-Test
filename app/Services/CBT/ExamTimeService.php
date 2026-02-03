<?php

namespace App\Services\CBT; // 👈 SUDAH SESUAI PERMINTAAN

use App\Models\TestUser;
use Carbon\Carbon;

class ExamTimeService
{
    /**
     * Apakah waktu ujian masih tersedia
     */
    public static function isStillRunning(TestUser $testUser): bool
    {
        if ($testUser->status === 'submitted' || $testUser->status === 'expired') {
            return false;
        }

        // Jika sedang dikunci, anggap masih running (Pause Mode)
        // Ini mencegah auto-expire saat sedang dilock
        if ($testUser->is_locked) {
            return true;
        }

        $endTime = self::getEndTime($testUser);

        return now()->lessThan($endTime);
    }

    /**
     * 🔥 CORE LOGIC: Hitung Waktu Berakhir (Server Side Authority)
     * Rumus: Waktu Mulai + Durasi Ujian + Extra Time + (Waktu Terkunci "Live")
     */
    public static function getEndTime(TestUser $testUser): Carbon
    {
        // 🔒 HARD GUARD
        if (is_null($testUser->started_at)) {
            return now();
        }

        if (!$testUser->relationLoaded('test')) {
            $testUser->load('test');
        }

        // 1. Ambil Durasi Dasar & Tambahan Waktu (Static)
        // 'extra_time' ini adalah waktu tambahan yang SUDAH disimpan di DB
        $baseDuration = $testUser->test->duration;
        $extraTime = $testUser->extra_time ?? 0;

        $totalDuration = $baseDuration + $extraTime;

        // 2. Hitung Waktu Selesai Personal Dasar
        $personalEndTime = Carbon::parse($testUser->started_at)
            ->addMinutes($totalDuration);

        // 3. 🔥 LOGIKA FREEZE: Kompensasi Waktu Terkunci (Dynamic)
        // Jika user SEDANG dikunci, deadline harus dimundurkan secara real-time
        // seiring berjalannya waktu, supaya sisa waktunya TETAP (tidak berkurang).
        if ($testUser->is_locked && $testUser->locked_at) {
            // Hitung berapa detik sudah berlalu sejak dikunci sampai DETIK INI
            $currentLockDuration = now()->diffInSeconds(Carbon::parse($testUser->locked_at));

            // Tambahkan durasi tersebut ke deadline
            $personalEndTime->addSeconds($currentLockDuration);
        }

        // 4. HARD LIMIT: Cek Waktu Selesai Global Ujian
        $globalEndTime = $testUser->test->end_time;

        if ($globalEndTime) {
            $globalEnd = Carbon::parse($globalEndTime);
            // Pilih mana yang lebih cepat, TAPI jika sedang dikunci, 
            // kita mungkin ingin mengabaikan global limit sementara? 
            // Untuk keamanan, biasanya global limit tetap berlaku (sekolah tutup ya tutup).
            return $personalEndTime->min($globalEnd);
        }

        return $personalEndTime;
    }

    /**
     * Sisa waktu (detik) - Realtime Server Time
     */
    public static function remainingSeconds(TestUser $testUser): int
    {
        $endTime = self::getEndTime($testUser);
        $now = now();

        // Jika waktu sekarang sudah melewati waktu selesai
        if ($now->greaterThanOrEqualTo($endTime)) {
            return 0;
        }

        // Hitung selisih detik
        return $now->diffInSeconds($endTime, false);
    }
}
