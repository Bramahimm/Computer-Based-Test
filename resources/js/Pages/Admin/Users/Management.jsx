import React from "react";
import Table from "@/Components/UI/Table";
import Button from "@/Components/UI/Button";

export default function Management({ users, onAddClick, onEditClick }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header Section */}
      <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2.5">
              <span className="material-icons">people</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Manajemen Mahasiswa
              </h1>
              <p className="text-[11px] text-gray-500 font-semibold">
                {users.length} mahasiswa terdaftar dalam sistem
              </p>
            </div>
          </div>
          <Button
            onClick={onAddClick}
            className="bg-green-600 hover:bg-green-700 text-white font-medium px-[0.7rem] py-2 text-sm transition-colors flex items-center">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Tambah Mahasiswa
          </Button>
        </div>
      </div>



      {/* Data Table */}
      <div className="p-6">
        <Table
          columns={[
            {
              label: "NPM",
              key: "npm",
              className: "font-mono text-sm",
            },
            {
              label: "Nama",
              key: "name",
              className: "font-semibold",
            },
            {
              label: "Grup",
              key: "groups",
              render: (g) =>
                g && g.length > 0 ? (
                  g.map((i) => i.name).join(", ")
                ) : (
                  <span className="text-gray-400 italic">-</span>
                ),
            },
          ]}
          data={users}
          emptyMessage={
            <div className="py-12 text-center">
              <div className="p-3 bg-gray-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">
                Belum ada mahasiswa terdaftar
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Mulai dengan menambahkan mahasiswa pertama Anda
              </p>
            </div>
          }
          onRowClick={onEditClick}
          className="cursor-pointer hover:bg-gray-50 transition-colors"
        />
      </div>
    </div>
  );
}
