<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreTestRequest;
use App\Http\Requests\Admin\UpdateTestRequest;
use App\Models\Test;
use App\Models\Group;
use App\Models\Module;
use App\Models\Topic;

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
