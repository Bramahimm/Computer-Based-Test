import React, { useState, useMemo } from "react";
import { router } from "@inertiajs/react";
import Button from "@/Components/UI/Button";
import Table from "@/Components/UI/Table";

// --- SUB-KOMPONEN KECIL ---

const SelectionHeader = () => (
  <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/30 flex items-center gap-4 text-left">
    <div className="p-2.5 bg-blue-600 rounded-lg text-white">
      <span className="material-icons text-xl">person_search</span>
    </div>
    <div>
      <h1 className="text-xl font-bold text-gray-900 uppercase tracking-tighter">Seleksi Pengguna</h1>
      <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">Manajemen Aksi Massal & Batching</p>
    </div>
  </div>
);

const BatchInstruction = () => (
  <div className="space-y-3 bg-gray-50 p-6 rounded-xl border border-gray-200 text-left">
    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Panduan Penggunaan</h3>
    {[
      "Gunakan filter grup untuk menyaring daftar mahasiswa.",
      "Centang mahasiswa yang ingin diproses secara massal.",
      "Pilih grup tujuan lalu klik 'Pindahkan' atau klik 'Hapus'."
    ].map((text, i) => (
      <div key={i} className="flex items-start gap-3 text-xs text-gray-600 italic">
        <span className="text-blue-600 font-bold">{i + 1}.</span>
        <p>{text}</p>
      </div>
    ))}
  </div>
);

// --- KOMPONEN UTAMA ---

export default function Selection({ users = [], groups = [] }) {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [filterGroup, setFilterGroup] = useState("");
  const [targetGroup, setTargetGroup] = useState("");

  const hasRoute = (routeName) => {
    try { return route().has(routeName); } catch (e) { return false; }
  };

  const filteredUsers = useMemo(() => {
    if (!filterGroup) return users;
    return users.filter((u) => u.groups.some((g) => g.id === parseInt(filterGroup)));
  }, [filterGroup, users]);

  const toggleSelectAll = (e) => {
    setSelectedUsers(e.target.checked ? filteredUsers.map((u) => u.id) : []);
  };

  const toggleSelectUser = (id) => {
    setSelectedUsers((prev) => prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]);
  };

  const handleBatchAssign = () => {
    if (selectedUsers.length === 0 || !targetGroup) return alert("Pilih data dan grup tujuan!");
    router.post(route("admin.users.batch-assign"), { user_ids: selectedUsers, group_id: targetGroup }, {
      onSuccess: () => { setSelectedUsers([]); alert("Batch Assign Berhasil!"); }
    });
  };

  const handleBatchDelete = () => {
    if (selectedUsers.length === 0) return;
    if (!hasRoute("admin.users.batch-destroy")) return alert("Fitur belum aktif di Backend.");
    if (confirm(`Hapus ${selectedUsers.length} user secara permanen?`)) {
      router.delete(route("admin.users.batch-destroy"), { data: { user_ids: selectedUsers }, onSuccess: () => setSelectedUsers([]) });
    }
  };

  const columns = [
    {
      label: (
        <input type="checkbox" onChange={toggleSelectAll} checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0} className="w-4 h-4 rounded text-green-600" />
      ),
      key: "checkbox",
      render: (_, user) => (
        <input type="checkbox" checked={selectedUsers.includes(user.id)} onChange={() => toggleSelectUser(user.id)} className="w-4 h-4 rounded text-green-600" />
      ),
    },
    { label: "Nama Lengkap", key: "name", className: "font-bold text-gray-800" },
    { label: "NPM", key: "npm", className: "font-mono text-xs text-gray-500" },
    {
      label: "Grup",
      key: "groups",
      render: (val) => (
        <div className="flex flex-wrap gap-1">
          {val.map((g) => <span key={g.id} className="bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded-full border border-blue-100 font-bold uppercase">{g.name}</span>)}
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden text-left">
      <SelectionHeader />

      <div className="p-8">
        {/* Filter Section */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-8 flex flex-col md:flex-row items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <span className="material-icons text-blue-600">filter_alt</span>
            <span className="text-xs font-black text-blue-800 uppercase tracking-widest">Filter Grup:</span>
          </div>
          <select value={filterGroup} onChange={(e) => setFilterGroup(e.target.value)} className="flex-1 border border-blue-200 bg-white text-sm rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-all">
            <option value="">Tampilkan Semua Pengguna</option>
            {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          {selectedUsers.length > 0 && (
            <div className="px-4 py-2 bg-blue-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest animate-pulse">
              {selectedUsers.length} Terpilih
            </div>
          )}
        </div>

        <Table columns={columns} data={filteredUsers} emptyMessage="Tidak ada data ditemukan." />

        {/* Action Area */}
        <div className="mt-10 pt-8 border-t border-gray-100 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Aksi Massal</h3>
            <div className="flex flex-col sm:flex-row gap-3 p-5 bg-gray-50 rounded-2xl border border-gray-100 shadow-inner">
              <select value={targetGroup} onChange={(e) => setTargetGroup(e.target.value)} className="flex-1 border border-gray-300 bg-white text-sm rounded-xl px-3 py-2 outline-none">
                <option value="">Target Grup Tujuan...</option>
                {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
              <div className="flex gap-2">
                <Button onClick={handleBatchAssign} disabled={!targetGroup || selectedUsers.length === 0} className="bg-green-600 text-[10px] uppercase font-bold px-6">Pindahkan</Button>
                <Button onClick={handleBatchDelete} disabled={selectedUsers.length === 0} variant="danger" className="text-[10px] uppercase font-bold px-6">Delete</Button>
              </div>
            </div>
          </div>
          <BatchInstruction />
        </div>
      </div>
    </div>
  );
}