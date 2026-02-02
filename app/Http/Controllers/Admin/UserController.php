<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Group;
use App\Models\TestUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Admin\GroupController;

class UserController extends Controller {

    public function index(Request $request) {
        $section = $request->input('section', 'management');

        if ($section === 'online') {
            return $this->handleOnline($request);
        }

        if ($section === 'groups') {
            return $this->handleGroups($request);
        }

        if ($section === 'selection') {
            return $this->handleSelection($request);
        }

        if ($section === 'individual') {
            return $this->handleIndividualResult($request);
        }


        // sisanya balik ke manajemen user biasa
        return $this->handleManagement($request);
    }

    private function handleGroups(Request $request) {
        $groups = GroupController::getGroupData($request);
        return inertia('Admin/Users/Index', [
            'section' => 'groups',
            'groups' => $groups, // data grup dikirim kesini
            'filters' => $request->only(['search']),
        ]);
    }

    // logic buat nampilin siapa aja yang lagi online
    private function handleOnline(Request $request) {
        $users = User::select('id', 'name', 'npm', 'role', 'email')
            ->orderBy('name', 'asc')
            ->paginate(10)
            ->withQueryString();

        $users->getCollection()->transform(function ($user) {
            $cacheKey = 'user-online-' . $user->id;
            $data = Cache::get($cacheKey);

            $user->is_online = $data ? true : false;
            $user->ip_address = $data['ip'] ?? '-';
            $user->last_activity = $data['last_activity'] ?? null;

            return $user;
        });

        $allUserIds = User::pluck('id');

        $totalOnlineCount = $allUserIds->filter(function ($id) {
            return Cache::get('user-online-' . $id) !== null;
        })->count();

        return inertia('Admin/Users/Index', [
            'section' => 'online',
            'users' => $users,
            'totalOnline' => $totalOnlineCount,
        ]);
    }

    // logic buat nampilin tabel seleksi massal
    private function handleSelection(Request $request) {
        $query = User::with('groups')
            ->where('role', 'peserta')
            ->latest();

        // filter pencarian
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('npm', 'like', "%{$request->search}%");
            });
        }

        // filter grup
        if ($request->group_id) {
            $query->whereHas('groups', fn($q) => $q->where('groups.id', $request->group_id));
        }

        return inertia('Admin/Users/Index', [
            'section' => 'selection',
            // pake withQueryString dengan appends biar gada error
            'users' => $query->paginate(50)->appends($request->query()),
            'groups' => Group::select('id', 'name')->get(),
            'filters' => $request->only(['search', 'group_id']),
        ]);
    }

    public function assignGroups(Request $request) {
        //Validasi Input
        $request->validate([
            'user_ids' => 'required|array|min:1',
            'group_ids' => 'required|array|min:1',
        ]);

        // Eksekusi Massal
        $users = User::whereIn('id', $request->user_ids)->get();

        DB::transaction(function () use ($users, $request) {
            foreach ($users as $user) {
                // syncWithoutDetaching agar grup lama ga ilang
                $user->groups()->syncWithoutDetaching($request->group_ids);
            }
        });

        return redirect()->route('admin.users.index', ['section' => 'selection'])
            ->with('success', count($users) . ' pengguna berhasil ditambahkan ke grup baru.');
    }

    // logic buat nampilin rapor atau hasil individu
    private function handleIndividualResult(Request $request) {
        $selectedUserId = $request->input('user_id');
        $selectedGroupId = $request->input('group_id');

        $groups = Group::select('id', 'name')->orderBy('name')->get();

        $usersInGroup = [];
        if ($selectedGroupId) {
            $usersInGroup = User::whereHas('groups', fn($q) => $q->where('groups.id', $selectedGroupId))
                ->where('role', 'peserta')
                ->select('id', 'name', 'npm')
                ->orderBy('name')
                ->get();
        }

        $studentReport = null;
        $studentStats = null;

        if ($selectedUserId) {
            $studentReport = TestUser::with(['test', 'result'])
                ->where('user_id', $selectedUserId)
                ->latest()
                ->get()
                ->map(function ($tu) {
                    return [
                        'test_title' => $tu->test->title ?? '-',
                        'start_time' => $tu->started_at,
                        'end_time'   => $tu->finished_at,
                        'status'     => $tu->status,
                        'score'      => $tu->result->total_score ?? 0,
                    ];
                });

            $studentStats = [
                'total_exams' => $studentReport->count(),
                'avg_score'   => round($studentReport->avg('score'), 1),
                'passed'      => $studentReport->where('score', '>=', 60)->count(),
            ];
        }

        return inertia('Admin/Users/Index', [
            'section' => 'individual',
            'groups' => $groups,
            'usersInGroup' => $usersInGroup,
            'studentReport' => $studentReport,
            'studentStats' => $studentStats,
            'filters' => [
                'group_id' => $selectedGroupId,
                'user_id' => $selectedUserId
            ]
        ]);
    }

    // logic default buat crud user biasa
    private function handleManagement(Request $request) {
        $query = User::with('groups')
            ->where('role', 'peserta')
            ->latest();

        // filter pencarian nama / npm
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('npm', 'like', "%{$request->search}%");
            });
        }

        // filter grup (angkatan) - logic baru
        if ($request->group_id) {
            $query->whereHas('groups', function ($q) use ($request) {
                $q->where('groups.id', $request->group_id);
            });
        }

        return inertia('Admin/Users/Index', [
            'section' => 'management',
            // jangan lupa appends biar filter gak ilang pas klik page 2
            'users' => $query->paginate(10)->appends($request->query()),

            // kirim data grup buat isi dropdown filter
            'groups' => Group::select('id', 'name')->orderBy('name')->get(),

            // balikin state filter ke frontend biar inputan gak kereset
            'filters' => $request->only(['search', 'group_id']),
        ]);
    }

    public function create() {
        return inertia('Admin/Users/Create', [
            'groups' => Group::all(),
        ]);
    }

    public function store(Request $request) {
        $request->validate([
            'name' => 'required|string',
            'npm' => 'nullable|string|unique:users,npm',
            'email' => 'required|email|unique:users,email',
            'groups' => 'required|array|min:1',
        ]);

        DB::transaction(function () use ($request) {
            $user = User::create([
                'name' => $request->name,
                'npm' => $request->npm,
                'email' => $request->email,
                'password' => Hash::make('password123'),
                'role' => 'peserta',
                'is_active' => true,
            ]);
            $user->groups()->sync($request->groups);
        });

        return redirect()->route('admin.users.index', ['section' => 'management'])
            ->with('success', 'User peserta berhasil ditambahkan');
    }

    public function show(User $user) {
        return inertia('Admin/Users/Show', [
            'user' => $user->load('groups', 'testUsers.test'),
        ]);
    }

    public function edit(User $user) {
        return inertia('Admin/Users/Edit', [
            'user' => $user,
            'groups' => Group::all(),
        ]);
    }

    public function update(Request $request, User $user) {
        $request->validate([
            'name' => 'required|string',
            'npm' => 'nullable|string|unique:users,npm,' . $user->id,
            'groups' => 'required|array|min:1',
        ]);

        $user->update($request->only('name', 'npm', 'is_active'));
        $user->groups()->sync($request->groups);

        return redirect()->route('admin.users.index')
            ->with('success', 'User berhasil diperbarui');
    }

    public function destroy(User $user) {
        $user->delete();
        return redirect()->route('admin.users.index')
            ->with('success', 'User berhasil dihapus');
    }
}
