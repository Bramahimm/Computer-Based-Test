<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Models\Topic;     // Pastikan import ini ada
use App\Models\Question;  // Pastikan import ini ada
use App\Http\Requests\Admin\StoreModuleRequest;
use App\Http\Requests\Admin\UpdateModuleRequest;
use Illuminate\Http\Request;

class ModuleController extends Controller
{
    /**
     * List modul (Index)
     * Menangani Logic Tab: Class, Subjects, dan Questions
     */
    public function index(Request $request)
    {
        // 1. Cek Section/Tab saat ini (default: class)
        $section = $request->input('section', 'class');

        // Data dasar yang SELALU dikirim (untuk tab Class/Modules)
        $data = [
            'modules' => Module::latest()->get(),
        ];

        // 2. LOGIC KHUSUS TAB 'QUESTIONS' (Optimasi Database)
        if ($section === 'questions') {
            $moduleId = $request->input('module_id');
            $topicId  = $request->input('topic_id');

            // A. Data untuk Dropdown Modul (Overwrite 'modules' agar lebih ringan khusus tab ini)
            // Mengambil ID & Name saja sudah cukup untuk dropdown
            $data['modules'] = Module::select('id', 'name')->orderBy('name')->get();

            // B. Data untuk Dropdown Topik 
            // (HANYA diambil jika Modul sudah dipilih)
            $data['topics'] = $moduleId
                ? Topic::select('id', 'name', 'module_id')
                ->where('module_id', $moduleId)
                ->where('is_active', true)
                ->orderBy('name')
                ->get()
                : []; // Jika belum pilih modul, topik kosong

            // C. Data List Soal 
            // (HANYA diambil jika Topik sudah dipilih)
            $data['questions'] = $topicId
                ? Question::with('answers')
                ->where('topic_id', $topicId)
                ->latest()
                ->paginate(50) // 🔥 UBAH GET() JADI PAGINATE()
                ->withQueryString() // Agar filter module_id & topic_id tidak hilang saat ganti page
                : null; // Jika belum pilih topik, soal kosong

            // D. Kirim Filter balik ke React (agar Dropdown tidak reset)
            $data['filters'] = [
                'module_id' => $moduleId,
                'topic_id'  => $topicId,
            ];
        }

        // 3. LOGIC KHUSUS TAB 'SUBJECTS' (Topics)
        if ($section === 'subjects') {
            $data['topics'] = Topic::with('module')
                ->where('is_active', true)
                ->latest()
                ->get();
        }

        return inertia('Admin/Modules/Index', $data);
    }

    /**
     * Form tambah modul
     */
    public function create()
    {
        return inertia('Admin/Modules/Create');
    }

    /**
     * Simpan modul baru
     */
    public function store(StoreModuleRequest $request)
    {
        Module::create($request->validated());

        return redirect()
            ->route('admin.modules.index')
            ->with('success', 'Modul berhasil ditambahkan');
    }

    /**
     * Detail modul
     */
    public function show(Module $module)
    {
        return inertia('Admin/Modules/Show', [
            'module' => $module->load('topics'),
        ]);
    }

    /**
     * Form edit modul
     */
    public function edit(Module $module)
    {
        return inertia('Admin/Modules/Edit', [
            'module' => $module,
        ]);
    }

    /**
     * Update modul
     */
    public function update(UpdateModuleRequest $request, Module $module)
    {
        $module->update($request->validated());

        return redirect()
            ->route('admin.modules.index')
            ->with('success', 'Modul berhasil diperbarui');
    }

    /**
     * Hapus modul
     */
    public function destroy(Module $module)
    {
        $module->delete();

        return redirect()
            ->route('admin.modules.index')
            ->with('success', 'Modul berhasil dihapus');
    }
}
