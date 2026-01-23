<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Models\Topic;
use App\Models\Question;
use App\Http\Requests\Admin\StoreModuleRequest;
use App\Http\Requests\Admin\UpdateModuleRequest;
use Illuminate\Http\Request;

class ModuleController extends Controller
{
    public function index(Request $request)
    {
        // 1. Cek Section/Tab saat ini
        $section = $request->input('section', 'class');

        // Data dasar
        $data = [
            'modules' => Module::latest()->get(),
            'section' => $section,
        ];

        // ==========================================
        // 🔥 TAMBAHKAN INI: LOGIC UNTUK TAB IMPORT
        // ==========================================
        if ($section === 'import') {
            $moduleId = $request->input('module_id');

            // Ambil Topik (hanya jika modul dipilih)
            $topics = [];
            if ($moduleId) {
                $topics = Topic::select('id', 'name', 'module_id')
                    ->where('module_id', $moduleId)
                    ->orderBy('name')
                    ->get();
            }

            // Return langsung ke View Import
            return inertia('Admin/Modules/Import', [
                'modules' => Module::select('id', 'name')->orderBy('name')->get(),
                'topics'  => $topics,
                'filters' => ['module_id' => $moduleId],
                'section' => 'import' // Penting agar sidebar/tab aktif
            ]);
        }
        // ==========================================

        // 2. LOGIC TAB 'QUESTIONS'
        if ($section === 'questions') {
            $moduleId = $request->input('module_id');
            $topicId  = $request->input('topic_id');

            $data['modules'] = Module::select('id', 'name')->orderBy('name')->get();

            $data['topics'] = $moduleId
                ? Topic::select('id', 'name', 'module_id')
                ->where('module_id', $moduleId)
                ->where('is_active', true)
                ->orderBy('name')
                ->get()
                : [];

            $data['questions'] = $topicId
                ? Question::with('answers')
                ->where('topic_id', $topicId)
                ->latest()
                ->paginate(50)
                ->withQueryString()
                : null;

            $data['filters'] = [
                'module_id' => $moduleId,
                'topic_id'  => $topicId,
            ];
        }

        // 3. LOGIC TAB 'SUBJECTS'
        if ($section === 'subjects') {
            $data['topics'] = Topic::with('module')
                ->where('is_active', true)
                ->latest()
                ->get();
        }

        // Default render halaman Index
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
            ->route('admin.modules.index', ['section' => 'class'])
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
            ->route('admin.modules.index', ['section' => 'class'])
            ->with('success', 'Modul berhasil diperbarui');
    }

    /**
     * Hapus modul
     */
    public function destroy(Module $module)
    {
        $module->delete();

        return redirect()
            ->route('admin.modules.index', ['section' => 'class'])
            ->with('success', 'Modul berhasil dihapus');
    }
}
