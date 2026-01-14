<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Group;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index()
    {
        return inertia('Admin/Users/Index', [
            'users' => User::with('groups')->where('role', 'peserta')->get(),
            'groups' => Group::all(),
        ]);
    }

    public function create()
    {
        return inertia('Admin/Users/Create', [
            'groups' => Group::all(),
        ]);

    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'npm' => 'nullable|string|unique:users,npm',
            'email' => 'required|email|unique:users,email',
            'groups' => 'required|array|min:1',
        ]);

        $user = User::create([
            'name' => $request->name,
            'npm' => $request->npm,
            'email' => $request->email,
            'password' => Hash::make('password123'),
            'role' => 'peserta',
            'is_active' => true,
        ]);

        $user->groups()->sync($request->groups);

        return redirect()->route('admin.users.index')
            ->with('success', 'User peserta berhasil ditambahkan');
    }

    public function show(User $user)
    {
        return inertia('Admin/Users/Show', [
            'user' => $user->load('groups', 'testUsers.test'),
        ]);
    }

    public function edit(User $user)
    {
        return inertia('Admin/Users/Edit', [
            'user' => $user,
            'groups' => Group::all(),
        ]);
    }

    public function update(Request $request, User $user)
    {
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

    public function destroy(User $user)
    {
        $user->delete();

        return redirect()->route('admin.users.index')
            ->with('success', 'User berhasil dihapus');
    }
}
