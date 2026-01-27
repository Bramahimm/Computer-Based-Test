import React from "react";
import Input from "@/Components/UI/Input";

export default function UserForm({ data, setData, errors, groups }) {
  // Logic pembatasan: Mahasiswa hanya boleh memilih 1 Group
  const handleGroupChange = (groupId) => {
    const isSelected = data.groups.includes(groupId);

    if (isSelected) {
      // Jika sudah terpilih, maka hapus dari array (uncheck)
      setData(
        "groups",
        data.groups.filter((id) => id !== groupId),
      );
    } else {
      // Jika belum terpilih, timpa array dengan ID baru (Single Choice)
      // Ini untuk 1 ID grup di dalam array data.groups
      setData("groups", [groupId]);
    }
  };

  return (
    <div className="space-y-4 text-left">
      <Input
        label="Nama"
        type="text"
        value={data.name}
        onChange={(e) => setData("name", e.target.value)}
        error={errors.name}
        placeholder="Masukkan nama lengkap"
      />

      <Input
        label="NPM"
        type="text"
        value={data.npm}
        onChange={(e) => setData("npm", e.target.value)}
        error={errors.npm}
        placeholder="Masukkan NPM"
      />

      <Input
        label="Email"
        type="email"
        value={data.email}
        onChange={(e) => setData("email", e.target.value)}
        error={errors.email}
        placeholder="email@contoh.com"
      />

      <div className="mt-4">
        <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">
          Target Grup / Angkatan Mahasiswa
        </label>

        {/* Grid sistem untuk pilihan grup */}
        <div className="grid grid-cols-2 gap-2">
          {groups.map((group) => (
            <label
              key={group.id}
              className={`flex items-center space-x-3 p-3 border rounded-xl hover:bg-gray-50 cursor-pointer transition-all duration-200 ${
                data.groups.includes(group.id)
                  ? "border-green-500 bg-green-50 ring-2 ring-green-500/10"
                  : "border-gray-200 bg-white"
              }`}>
              <input
                type="checkbox"
                checked={data.groups.includes(group.id)}
                onChange={() => handleGroupChange(group.id)}
                className="rounded-full border-gray-300 text-[#00a65a] focus:ring-[#00a65a] w-4 h-4 transition-all"
              />
              <span
                className={`text-xs font-bold uppercase tracking-tight ${
                  data.groups.includes(group.id)
                    ? "text-green-700"
                    : "text-gray-600"
                }`}>
                {group.name}
              </span>
            </label>
          ))}
        </div>

        <p className="mt-3 text-[9px] text-gray-400 font-medium italic">
          * Mahasiswa hanya dapat terdaftar dalam satu grup aktif.
        </p>

        {errors.groups && (
          <p className="mt-2 text-[10px] text-red-500 font-bold uppercase tracking-widest italic">
            {errors.groups}
          </p>
        )}
      </div>
    </div>
  );
}
