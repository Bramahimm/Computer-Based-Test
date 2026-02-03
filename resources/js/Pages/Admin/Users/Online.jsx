import React, { useEffect } from "react";
import { router } from "@inertiajs/react";
import { Monitor, RefreshCw, Wifi, Clock } from "lucide-react";
import Table from "@/Components/UI/Table";
import Pagination from "@/Components/UI/Pagination";

export default function Online({ users, totalOnline }) {
  useEffect(() => {
    const interval = setInterval(() => {
      router.reload({ only: ["users", "totalOnline"], preserveScroll: true });
    }, 40000);

    return () => clearInterval(interval);
  }, []);

  // penghitung durasi yang lebih detail
  const timeAgo = (date) => {
    if (!date) return "-";
    const now = new Date();
    const activity = new Date(date);
    const diffSeconds = Math.floor((now - activity) / 1000);

    if (diffSeconds < 10) return "Baru saja";
    if (diffSeconds < 60) return `${diffSeconds} detik lalu`;

    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes} menit lalu`;

    return `${Math.floor(diffMinutes / 60)} jam lalu`;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="p-2.5">
            <Wifi className="w-6 h-6" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              Monitoring Aktivitas
            </h1>
            <p className="text-xs text-gray-500 font-medium flex items-center gap-2 mt-0.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              <span className="font-bold text-gray-700">
                {totalOnline || 0}
              </span>{" "}
              pengguna sedang online
            </p>
          </div>
        </div>

        {/* Indikator Refresh */}
        <div className="hidden sm:flex items-center gap-2 text-[10px] text-gray-400 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
          <RefreshCw className="w-3 h-3 animate-spin-slow" />
          Live Update: 40s
        </div>
      </div>

      <div className="p-0">
        <Table
          data={users.data || []}
          emptyMessage="Tidak ada aktivitas pengguna saat ini."
          columns={[
            {
              label: "Pengguna",
              key: "name",
              className: "w-1/3 pl-6",
              render: (val, row) => (
                <div className="flex flex-col">
                  <span className="font-bold text-gray-900 text-sm">{val}</span>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                    <span className="font-mono bg-gray-100 px-1 rounded">
                      {row.npm || "-"}
                    </span>
                    <span>•</span>
                    <span className="truncate max-w-[150px]">{row.email}</span>
                  </div>
                </div>
              ),
            },
            {
              label: "Role",
              key: "role",
              className: "text-center w-1/6",
              render: (role) => (
                <div className="flex justify-center">
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${role === "admin" ? "bg-purple-50 text-purple-600 border-purple-100" : "bg-blue-50 text-blue-600 border-blue-100"}`}>
                    {role}
                  </span>
                </div>
              ),
            },
            {
              label: "Status Koneksi",
              key: "is_online",
              className: "text-center w-1/6",
              render: (isOnline) => (
                <div className="flex justify-center">
                  {isOnline ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full shadow-sm">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                      Online
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-gray-400 bg-gray-50 border border-gray-100 rounded-full">
                      <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                      Offline
                    </span>
                  )}
                </div>
              ),
            },
            {
              label: "Aktivitas Terakhir",
              key: "last_activity",
              className: "text-right pr-6 w-1/3",
              render: (date, row) => {
                if (!row.is_online || !date)
                  return (
                    <span className="text-gray-300 text-xs italic">
                      Tidak ada data
                    </span>
                  );

                return (
                  <div className="flex items-center justify-end gap-2">
                    <div className="text-right">
                      <div className="text-xs font-bold text-gray-700">
                        {timeAgo(date)}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono">
                        {date}
                      </div>
                    </div>
                    <Clock className="w-4 h-4 text-gray-300" />
                  </div>
                );
              },
            },
          ]}
        />
      </div>

      <div className="p-4 border-t border-gray-100 bg-gray-50">
        {users.links && <Pagination links={users.links} />}
      </div>
    </div>
  );
}