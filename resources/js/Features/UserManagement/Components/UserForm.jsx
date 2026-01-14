import React from "react";
import Input from "@/Components/UI/Input";

export default function UserForm({ data, setData, errors, groups }) {
  const handleGroupChange = (groupId) => {
    const isSelected = data.groups.includes(groupId);
    if (isSelected) {
      setData(
        "groups",
        data.groups.filter((id) => id !== groupId)
      );
    } else {
      setData("groups", [...data.groups, groupId]);
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
        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tighter">
          Groups / Angkatan
        </label>
        <div className="grid grid-cols-2 gap-2">
          {groups.map((group) => (
            <label
              key={group.id}
              className={`flex items-center space-x-2 p-3 border rounded-xl hover:bg-gray-50 cursor-pointer transition-all ${
                data.groups.includes(group.id)
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200"
              }`}>
              <input
                type="checkbox"
                checked={data.groups.includes(group.id)}
                onChange={() => handleGroupChange(group.id)}
                className="rounded border-gray-300 text-[#00a65a] focus:ring-[#00a65a] w-4 h-4"
              />
              <span className="text-sm font-medium text-gray-700">
                {group.name}
              </span>
            </label>
          ))}
        </div>
        {errors.groups && (
          <p className="mt-2 text-xs text-red-500 font-bold italic">
            {errors.groups}
          </p>
        )}
      </div>
    </div>
  );
}
