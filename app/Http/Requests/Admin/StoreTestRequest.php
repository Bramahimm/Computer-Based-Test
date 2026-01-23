<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreTestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'duration' => 'required|integer|min:1',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'is_active' => 'nullable|boolean',

            'groups' => 'required|array|min:1',
            'groups.*' => 'exists:groups,id',

            'topics' => 'required|array|min:1',
            'topics.*.id' => 'required|exists:topics,id',
            'topics.*.total_questions' => 'required|integer|min:1',
            'topics.*.question_type' => 'nullable|string',
        ];
    }
    public function messages(): array
    {
        return [
            'end_time.after' => 'Waktu selesai harus sesudah waktu mulai.',
            'groups.required' => 'Pilih minimal satu angkatan/grup.',
            'topics.required' => 'Pilih minimal satu topik ujian.',
        ];
    }
}


// <?php

// namespace App\Http\Requests\Admin;

// use Illuminate\Foundation\Http\FormRequest;
// use Illuminate\Validation\Rule;
// use App\Models\Question; // Pastikan import model Question

// class StoreTestRequest extends FormRequest
// {
//     public function authorize(): bool
//     {
//         return $this->user()?->role === 'admin';
//     }

//     public function rules(): array
//     {
//         return [
//             'title'       => 'required|string|max:255',
//             'description' => 'nullable|string',
//             'duration'    => 'required|integer|min:1',
//             // Tambahkan after_or_equal:now agar tidak buat ujian di masa lalu
//             'start_time'  => 'required|date|after_or_equal:now',
//             'end_time'    => 'required|date|after:start_time',
//             'is_active'   => 'nullable|boolean',

//             'groups'   => 'required|array|min:1',
//             'groups.*' => 'exists:groups,id',

//             'topics' => 'required|array|min:1',
//             'topics.*.id' => 'required|exists:topics,id',

//             // Validasi Tipe Soal (Strict)
//             'topics.*.question_type' => [
//                 'nullable',
//                 'string',
//                 Rule::in(['multiple_choice', 'essay', 'short_answer'])
//             ],

//             // 🔥 VALIDASI LOGIKA JUMLAH SOAL 🔥
//             'topics.*.total_questions' => [
//                 'required',
//                 'integer',
//                 'min:1',
//                 function ($attribute, $value, $fail) {
//                     // Ambil index array dari attribute, misal: topics.0.total_questions
//                     $index = explode('.', $attribute)[1];

//                     // Ambil topic_id dan tipe soal dari input yang sedang dikirim
//                     $topicId = $this->input("topics.{$index}.id");
//                     $type    = $this->input("topics.{$index}.question_type");

//                     // Query Cek Ketersediaan Soal di DB
//                     $query = Question::where('topic_id', $topicId)->where('is_active', true);

//                     if ($type) {
//                         $query->where('type', $type);
//                     }

//                     $availableCount = $query->count();

//                     if ($value > $availableCount) {
//                         $fail("Jumlah soal tidak cukup. Topik ini hanya memiliki {$availableCount} soal aktif" . ($type ? " tipe {$type}." : "."));
//                     }
//                 },
//             ],
//         ];
//     }

//     public function messages(): array
//     {
//         return [
//             'end_time.after' => 'Waktu selesai harus sesudah waktu mulai.',
//             'groups.required' => 'Pilih minimal satu angkatan/grup.',
//             'topics.required' => 'Pilih minimal satu topik ujian.',
//             'start_time.after_or_equal' => 'Waktu mulai tidak boleh di masa lalu.',
//         ];
//     }

//     // Opsional: Casting boolean string "true"/"false" atau "1"/"0" dari frontend
//     protected function prepareForValidation()
//     {
//         $this->merge([
//             'is_active' => $this->boolean('is_active'),
//         ]);
//     }
// }
