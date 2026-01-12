import React, { useState, useMemo } from "react";
import { router } from "@inertiajs/react";
import Button from "@/Components/UI/Button";
import Table from "@/Components/UI/Table";

export default function Selection({ users = [], groups = [] }) {
  // 1. State untuk Selection
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [filterGroup, setFilterGroup] = useState("");
  const [targetGroup, setTargetGroup] = useState("");

  // 2. Logic Filter Frontend (Agar User bisa mencari mahasiswa per grup di UI)
  const filteredUsers = useMemo(() => {
    if (!filterGroup) return users;
    return users.filter((user) =>
      user.groups.some((g) => g.id === parseInt(filterGroup))
    );
  }, [filterGroup, users]);

  const hasRoute = (routeName) => {
    try {
      return route().has(routeName);
    } catch (e) {
      return false;
    }
  };

  // 3. Handlers untuk Checkbox
  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(filteredUsers.map((u) => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const toggleSelectUser = (id) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  // 4. Batch Action Handlers (Menyiapkan Request ke Backend)
  const handleBatchAssign = () => {
    if (selectedUsers.length === 0 || !targetGroup) {
      alert("Pilih mahasiswa dan grup target terlebih dahulu!");
      return;
    }

    // Kita asumsikan endpoint rute ini akan dibuat di backend nantinya
    router.post(
      route("admin.users.batch-assign"),
      {
        user_ids: selectedUsers,
        group_id: targetGroup,
      },
      {
        onSuccess: () => {
          setSelectedUsers([]);
          alert("Mahasiswa berhasil dipindahkan ke grup baru.");
        },
      }
    );
  };

  const handleBatchDelete = () => {
    if (selectedUsers.length === 0) return;
    // Proteksi: Cek apakah rute tersedia di Laravel
    if (!hasRoute("admin.users.batch-destroy")) {
      alert("Fitur Backend 'Batch Delete' belum diaktifkan oleh Admin Sistem.");
      console.error(
        "Error: Route admin.users.batch-destroy not found in Ziggy."
      );
      return;
    }

    if (
      confirm(
        `Hapus ${selectedUsers.length} mahasiswa terpilih secara permanen?`
      )
    ) {
      router.delete(route("admin.users.batch-destroy"), {
        data: { user_ids: selectedUsers },
        onSuccess: () => setSelectedUsers([]),
      });
    }
  };

  const columns = [
    {
      label: (
        <input
          type="checkbox"
          onChange={toggleSelectAll}
          checked={
            selectedUsers.length === filteredUsers.length &&
            filteredUsers.length > 0
          }
          className="w-4 h-4 cursor-pointer rounded border-gray-300 text-green-600 focus:ring-green-500"
        />
      ),
      key: "checkbox",
      render: (_, user) => (
        <input
          type="checkbox"
          checked={selectedUsers.includes(user.id)}
          onChange={() => toggleSelectUser(user.id)}
          className="w-4 h-4 cursor-pointer rounded border-gray-300 text-green-600 focus:ring-green-500"
        />
      ),
    },
    { label: "Nama Lengkap", key: "name", className: "font-semibold" },
    { label: "NPM", key: "npm", className: "font-mono text-sm" },
    {
      label: "Grup Saat Ini",
      key: "groups",
      render: (val) => (
        <div className="flex flex-wrap gap-1.5">
          {val.length > 0
            ? val.map((g) => (
                <span
                  key={g.id}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-md border border-blue-200"
                >
                  {g.name}
                </span>
              ))
            : <span className="text-gray-400 text-xs italic">-</span>}
        </div>
      ),
    },
    {
      label: "Status",
      key: "is_active",
      render: (val) =>
        val ? (
          <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-md border border-green-200">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            Aktif
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-md border border-red-200">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
            Non-Aktif
          </span>
        ),
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header Section */}
      <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/30">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-blue-50 rounded-lg text-blue-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Seleksi Pengguna
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Kelola dan pindahkan pengguna antar grup secara massal
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Header */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Manajemen Aksi Massal
          </h2>
          <p className="text-sm text-gray-500">
            {selectedUsers.length > 0 
              ? `${selectedUsers.length} pengguna dipilih • `
              : ''
            }
            Menampilkan {filteredUsers.length} dari {users.length} pengguna
          </p>
        </div>

        {/* Filter Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2 flex-shrink-0">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="text-sm font-medium text-blue-800">Filter:</span>
            </div>
            <select
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              className="flex-1 min-w-0 border border-blue-300 bg-white text-sm rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            >
              <option value="">Semua Grup</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Users Counter */}
        {selectedUsers.length > 0 && (
          <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md text-sm font-medium border border-blue-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {selectedUsers.length} pengguna dipilih
          </div>
        )}

        {/* Data Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <Table
            columns={columns}
            data={filteredUsers}
            emptyMessage={
              <div className="py-12 text-center">
                <div className="p-3 bg-gray-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">Pengguna tidak ditemukan</p>
                <p className="text-sm text-gray-400 mt-1">Coba ubah filter pencarian Anda</p>
              </div>
            }
          />
        </div>

        {/* Batch Actions Area */}
        <div className="mt-6 border-t border-gray-100 pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Action Panel */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Aksi Pengguna Terpilih
              </h3>
              <div className="flex flex-col sm:flex-row gap-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <select
                  value={targetGroup}
                  onChange={(e) => setTargetGroup(e.target.value)}
                  className="flex-1 border border-gray-300 bg-white text-sm rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                >
                  <option value="">Pilih Grup Tujuan...</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
                <Button
                  onClick={handleBatchAssign}
                  disabled={!targetGroup || selectedUsers.length === 0}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium text-sm px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Pindahkan
                </Button>
                <Button
                  onClick={handleBatchDelete}
                  disabled={selectedUsers.length === 0}
                  variant="danger"
                  className="font-medium text-sm px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Hapus
                </Button>
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Panduan Penggunaan
              </h3>
              <div className="text-sm text-gray-600 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-xs font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded mt-0.5">1</span>
                  <p>Gunakan filter di atas untuk menyaring daftar pengguna.</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-xs font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded mt-0.5">2</span>
                  <p>Centang pengguna yang ingin dipindahkan atau dihapus.</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-xs font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded mt-0.5">3</span>
                  <p>Pilih grup tujuan dan klik "Pindahkan" untuk mengganti grup.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}