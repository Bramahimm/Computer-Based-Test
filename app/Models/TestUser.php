<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TestUser extends Model
{
    use HasFactory;

    protected $fillable = [
        'test_id',
        'user_id',
        'started_at',
        'finished_at',
        'status',
        'current_index',
        'last_question_id',
        'last_activity_at',
    ];

    /**
     * CASTING WAJIB (ANTI ERROR TIMER & CARBON)
     */
    protected $casts = [
        'started_at'       => 'datetime',
        'finished_at'      => 'datetime',
        'last_activity_at' => 'datetime', 
        'current_index'    => 'integer',
    ];

    /* ================= RELATIONS ================= */

    // TestUser → Ujian
    public function test()
    {
        return $this->belongsTo(Test::class);
    }

    // TestUser → User
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // TestUser → Jawaban Peserta
    public function answers()
    {
        return $this->hasMany(UserAnswer::class);
    }

    // TestUser → Nilai akhir
    public function result()
    {
        return $this->hasOne(Result::class);
    }

    // Berguna jika Anda ingin menampilkan "Lanjut mengerjakan soal: [Judul Soal]" di dashboard
    public function lastQuestion()
    {
        return $this->belongsTo(Question::class, 'last_question_id');
    }
}
