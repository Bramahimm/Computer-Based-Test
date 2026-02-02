import React, { useEffect } from "react";
import { router } from "@inertiajs/react";
import { Monitor, RefreshCw, Wifi } from "lucide-react";
import Table from "@/Components/UI/Table";
import Pagination from "@/Components/UI/Pagination";

// PERBAIKAN: Tambahkan 'totalOnline' disini
export default function Online({ users, totalOnline }) {
  useEffect(() => {
    const interval = setInterval(() => {
      router.reload({ only: ["users", "totalOnline"], preserveScroll: true });
    }, 40000);

    return () => clearInterval(interval);
  }, []);

  // Helper hitung durasi
  const timeAgo = (date) => {
    if (!date) return "-";
    const diff = Math.floor((new Date() - new Date(date)) / 1000);
    if (diff < 60) return `${diff} detik lalu`;
    return `${Math.floor(diff / 60)} menit lalu`;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/30 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="p-2.5">
            <Wifi className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Pengguna Online
            </h1>
            <p className="text-[11px] text-gray-500 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
              {/* Sekarang variabel ini sudah dikenali */}
              {totalOnline || 0} pengguna aktif saat ini
            </p>
          </div>
        </div>

        {/* Indikator Refresh */}
        <div className="text-[10px] text-gray-400 flex items-center gap-1 bg-gray-50 px-2 py-1 rounded border border-gray-100">
          <RefreshCw className="w-3 h-3" />
          Auto-refresh: 40s
        </div>
      </div>

      <div className="p-6">
        <Table
          data={users.data || []}
          emptyMessage="Tidak ada pengguna ditemukan."
          columns={[
            {
              label: "Nama Pengguna",
              key: "name",
              className: "text-sm",
              render: (val, row) => (
                <div>
                  <div>{val}</div>
                  <div className="text-[11px] text-gray-400">
                    {row.npm || row.email}
                  </div>
                </div>
              ),
            },
            {
              label: "Role",
              key: "role",
              className: "text-center",
              render: (role) => (
                <span className="text-[10px] font-bold uppercase text-gray-500 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                  {role}
                </span>
              ),
            },
            // --- KOLOM STATUS ---
            {
              label: "Status",
              key: "is_online",
              className: "text-center",
              render: (isOnline) => (
                <div className="flex justify-center">
                  {isOnline ? (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-bold bg-green-100 rounded-lg text-green-600 animate-pulse">
                      Online
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-bold text-gray-500">
                      Offline
                    </span>
                  )}
                </div>
              ),
            },
            {
              label: "Aktivitas Terakhir",
              key: "last_activity",
              className: "text-right text-xs text-gray-500",
              render: (date, row) => {
                if (!row.is_online || !date)
                  return <span className="text-gray-300">-</span>;
                return (
                  <span className="text-green-700 font-medium">
                    {timeAgo(date)}
                  </span>
                );
              },
            },
          ]}
        />

        <div className="mt-4">
          {users.links && <Pagination links={users.links} />}
        </div>
      </div>
    </div>
  );
}
