<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;


use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreTestRequest;
use App\Http\Requests\Admin\UpdateTestRequest;
use App\Models\Test;
use App\Models\Group;
use App\Models\Module;
use App\Models\Topic;
use App\Models\TestUser;


class TestController extends Controller
{
    /* ================= INDEX ================= */
    public function index()
    {
        return inertia('Admin/Tests/Index', [
            'tests' => Test::with('groups', 'topics')->latest()->get(),
            'modules' => Module::where('is_active', true) -> get(),
            'groups' => Group::all(),
            'topics' => Topic::with('module')
                ->where('is_active', true)
                ->get(),
            'results' => TestUser::with('user', 'test', 'result')
                ->whereHas('result')
                ->get(),
        ]);
    

        // 2. Filter Pencarian (Judul Ujian)
        if ($request->search) {
            $query->where('title', 'like', "%{$request->search}%");
        }

        // 3. Filter berdasarkan Modul
        // Karena Test tidak punya module_id, kita cek via relasi topics
        if ($request->module_id) {
            $query->whereHas('topics', function($q) use ($request) {
                $q->where('module_id', $request->module_id);
            });
        }

        // 4. Filter berdasarkan Target Grup
        if ($request->group_id) {
            $query->whereHas('groups', function($q) use ($request) {
                $q->where('groups.id', $request->group_id);
            });
        }

        return inertia('Admin/Tests/Index', [
            // Gunakan paginate + appends agar filter tidak hilang saat ganti halaman
            'tests' => $query->paginate(10)->appends($request->query()),

            // Data untuk Dropdown Filter
            'modules' => Module::select('id', 'name')
                ->where('is_active', true)
                ->orderBy('name')
                ->get(),
                
            'groups' => Group::select('id', 'name')
                ->orderBy('name')
                ->get(),

            // Data pendukung form create/edit (biarkan seperti semula)
            'topics' => Topic::with('module')
                ->where('is_active', true)
                ->get(),

            // Kirim balik state filter ke frontend agar inputan tidak reset
            'filters' => $request->only(['search', 'module_id', 'group_id']),
        ]);
    }
    /* ================= CREATE ================= */
    public function create()
    {
        return inertia('Admin/Tests/Create', [
            'groups' => Group::all(),
            'topics' => Topic::with('module')
                ->where('is_active', true)
                ->get(),
        ]);
    }

    /* ================= STORE ================= */
    public function store(StoreTestRequest $request)
    {
        $data = $request->validated();

        $test = Test::create([
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'duration' => $data['duration'],
            'start_time' => $data['start_time'],
            'end_time' => $data['end_time'],
            'is_active' => $data['is_active'] ?? true,
        ]);

        // Assign group (angkatan)
        $test->groups()->sync($data['groups']);

        // Assign topik ujian
        $syncTopics = [];
        foreach ($data['topics'] as $topic) {
            $syncTopics[$topic['id']] = [
                'total_questions' => $topic['total_questions'],
                'question_type' => $topic['question_type'] ?? 'mixed',
            ];
        }
        $test->topics()->sync($syncTopics);

        return redirect()
            ->route('admin.tests.index')
            ->with('success', 'Ujian berhasil dibuat');
    }

    /* ================= SHOW ================= */
    public function show(Test $test)
    {
        $test->load('groups', 'topics.module');

        return inertia('Admin/Tests/Show', [
            'test' => $test,
        ]);
    }

    /* ================= EDIT ================= */
    public function edit(Test $test)
    {
        $test->load('groups', 'topics');

        return inertia('Admin/Tests/Edit', [
            'test' => $test,
            'groups' => Group::all(),
            'topics' => Topic::with('module')
                ->where('is_active', true)
                ->get(),
        ]);
    }

    /* ================= UPDATE ================= */
    public function update(UpdateTestRequest $request, Test $test)
    {
        $data = $request->validated();

        $test->update([
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'duration' => $data['duration'],
            'start_time' => $data['start_time'],
            'end_time' => $data['end_time'],
            'is_active' => $data['is_active'] ?? $test->is_active,
        ]);

        // Update group
        $test->groups()->sync($data['groups']);

        // Update topik
        $syncTopics = [];
        foreach ($data['topics'] as $topic) {
            $syncTopics[$topic['id']] = [
                'total_questions' => $topic['total_questions'],
                'question_type' => $topic['question_type'] ?? 'mixed',
            ];
        }
        $test->topics()->sync($syncTopics);

        return redirect()
            ->route('admin.tests.index')
            ->with('success', 'Ujian berhasil diperbarui');
    }

    /* ================= DESTROY ================= */
    public function destroy(Test $test)
    {
        $test->delete();

        return redirect()
            ->route('admin.tests.index')
            ->with('success', 'Ujian berhasil dihapus');
    }
}
