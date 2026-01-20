<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ImportQuestionsRequest;
use App\Imports\QuestionsImport;
use App\Models\Topic;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ImportQuestionController extends Controller
{
    /**
     * Tampilkan Halaman Import dengan List Topik
     */
    public function create()
    {
        // 1. Ambil Data Modul (Hanya ID dan Nama)
        $modules = \App\Models\Module::select('id', 'name')->get();

        // 2. Ambil Data Topik (Sertakan module_id untuk filtering di frontend)
        $topics = \App\Models\Topic::select('id', 'name', 'module_id')
            ->where('is_active', true)
            ->get();

        return inertia('Admin/Questions/Import', [
            'modules' => $modules, // Data untuk dropdown pertama
            'topics'  => $topics   // Data untuk dropdown kedua (akan difilter JS)
        ]);
    }

    /**
     * Proses Import Excel
     */
    public function store(ImportQuestionsRequest $request)
    {
        $file = $request->file('file');
        $topicId = $request->topic_id;

        DB::beginTransaction();
        try {
            $importer = new QuestionsImport($topicId);
            Excel::import($importer, $file);

            DB::commit();

            $msg = "Berhasil mengimport {$importer->importedCount} soal.";

            // Cek jika ada baris yang dilewati (skipped)
            if (count($importer->skipped) > 0) {
                $skippedMsg = implode("\n", array_slice($importer->skipped, 0, 5));
                if (count($importer->skipped) > 5) $skippedMsg .= "\n...dan lainnya.";

                return redirect()->back()->with('warning', "$msg\n\nBeberapa data dilewati:\n" . $skippedMsg);
            }

            return redirect()->back()->with('success', $msg);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage());

            // Gunakan nama route lengkap: 'admin.' + 'questions.import.view'
            return redirect()
                ->route('admin.questions.import.view')
                ->withErrors(['file' => 'Gagal Import: ' . $e->getMessage()]);
        }
    }

    /**
     * Download Template CSV (Tanpa Kolom Score)
     */
    public function downloadTemplate()
    {
        $filename = 'template_bank_soal_indo.csv';

        $headers = [
            "Content-type"        => "text/csv; charset=utf-8",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        // 🔥 HEADER BAHASA INDONESIA
        $columns = [
            'Teks Soal',
            'Tipe Soal (pilihan_ganda / esai)',
            'Pilihan A',
            'Pilihan B',
            'Pilihan C',
            'Pilihan D',
            'Pilihan E',
            'Kunci Jawaban (A/B/C/D/E)'
        ];

        // Contoh 1: Pilihan Ganda
        $example1 = [
            'Siapa presiden pertama Indonesia?', // Soal
            'pilihan_ganda',                     // Tipe (Indo)
            'Soeharto',                          // A
            'B.J. Habibie',                      // B
            'Ir. Soekarno',                      // C
            'Joko Widodo',                       // D
            'Megawati',                          // E
            'C'                                  // Kunci
        ];

        // Contoh 2: Esai
        $example2 = [
            'Jelaskan makna Bhinneka Tunggal Ika.',
            'esai',
            '',
            '',
            '',
            '',
            '',
            '' // Opsi kosong
        ];

        $callback = function () use ($columns, $example1, $example2) {
            $file = fopen('php://output', 'w');
            fputs($file, "\xEF\xBB\xBF"); // BOM agar Excel baca UTF-8 aman

            fputcsv($file, $columns);
            fputcsv($file, $example1);
            fputcsv($file, $example2);

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
