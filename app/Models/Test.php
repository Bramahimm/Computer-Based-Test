<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Test extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'duration',
        'start_time',
        'end_time',
        'is_active',
    ];

    // Ujian ↔ Topik
    public function topics()
    {
        return $this->belongsToMany(Topic::class, 'test_topics')
            ->withPivot([
                'total_questions',
                'question_type',
                // 🔥 WAJIB DITAMBAHKAN AGAR SETTINGAN TERBACA 🔥
                'random_questions',
                'random_answers',
                'max_answers',
                'answer_mode'
            ])
            ->withTimestamps();
    }

    // Ujian ↔ Angkatan
    public function groups()
    {
        return $this->belongsToMany(Group::class, 'test_groups');
    }

    // Ujian → Peserta yang ikut
    public function testUsers()
    {
        return $this->hasMany(TestUser::class);
    }
    
}
