<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreTestRequest;
use App\Http\Requests\Admin\UpdateTestRequest;
use App\Models\Test;
use App\Models\Group;
use App\Models\Module;
use App\Models\Topic;
use App\Models\TestUser;
use Illuminate\Http\Request;

class TestController extends Controller
{
    /* ================= INDEX ================= */
    public function index(Request $request)
    {
        // 1. Start building the query
        $query = Test::with('groups', 'topics')->latest();

        // 2. Search Filter (Exam Title)
        if ($request->search) {
            $query->where('title', 'like', "%{$request->search}%");
        }

        // 3. Filter by Module
        // Since Test doesn't have module_id, we check via the topics relationship
        if ($request->module_id) {
            $query->whereHas('topics', function ($q) use ($request) {
                $q->where('module_id', $request->module_id);
            });
        }

        // 4. Filter by Target Group
        if ($request->group_id) {
            $query->whereHas('groups', function ($q) use ($request) {
                $q->where('groups.id', $request->group_id);
            });
        }

        // 5. Execute query with pagination and return response
        return inertia('Admin/Tests/Index', [
            // Use paginate + appends so filters persist across pages
            'tests' => $query->paginate(10)->appends($request->query()),

            // Data for Dropdown Filters
            'modules' => Module::select('id', 'name')
                ->where('is_active', true)
                ->orderBy('name')
                ->get(),

            'groups' => Group::select('id', 'name')
                ->orderBy('name')
                ->get(),

            // Supporting data for create/edit forms
            // Note: Sending 'results' here might be heavy if not paginated. 
            // Consider moving 'results' to a separate dedicated controller/view if the dataset is large.
            'topics' => Topic::with('module')
                ->where('is_active', true)
                ->get(),

            // Test Users with full relationships for Results section
            'testUsers' => TestUser::with([
                'user:id,name,email',
                'test:id,title,duration,description',
                'test.topics:id,name',
                'test.topics.questions:id,topic_id',
                'answers:id,test_user_id,question_id,answer_id,is_correct',
                'result:id,test_user_id,total_score,status',
                'locker:id,name'
            ])
                ->latest('started_at')
                ->get()
                ->map(function ($testUser) {
                    // Calculate total questions from topics
                    $questionsCount = 0;
                    if ($testUser->test && $testUser->test->topics) {
                        $questionsCount = $testUser->test->topics->sum(function ($topic) {
                            return $topic->questions ? $topic->questions->count() : 0;
                        });
                    }
                    $testUser->test->questions_count = $questionsCount;
                    return $testUser;
                }),

            // Send filter state back to frontend so inputs don't reset
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

        // Assign group (batch)
        if (isset($data['groups'])) {
            $test->groups()->sync($data['groups']);
        }

        // Assign exam topics
        $syncTopics = [];
        if (isset($data['topics'])) {
            foreach ($data['topics'] as $topic) {
                $syncTopics[$topic['id']] = [
                    'total_questions' => $topic['total_questions'],
                    'question_type' => $topic['question_type'] ?? 'mixed',
                ];
            }
            $test->topics()->sync($syncTopics);
        }

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
        if (isset($data['groups'])) {
            $test->groups()->sync($data['groups']);
        }

        // Update topics
        if (isset($data['topics'])) {
            $syncTopics = [];
            foreach ($data['topics'] as $topic) {
                $syncTopics[$topic['id']] = [
                    'total_questions' => $topic['total_questions'],
                    'question_type' => $topic['question_type'] ?? 'mixed',
                ];
            }
            $test->topics()->sync($syncTopics);
        }

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
