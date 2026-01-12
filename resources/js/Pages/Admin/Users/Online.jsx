import React, { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import Table from "@/Components/UI/Table";
import Button from "@/Components/UI/Button";

// --- SUB-KOMPONEN KECIL ---

const OnlineStats = ({ count }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
    <StatCard label="Pengguna Online" value={count} color="blue" icon="bolt" />
    <StatCard
      label="Update Otomatis"
      value="30s"
      color="purple"
      icon="schedule"
    />
    <StatCard
      label="Status Sistem"
      value="Stabil"
      color="green"
      icon="check_circle"
    />
  </div>
);

const StatCard = ({ label, value, color, icon }) => (
  <div className={`bg-${color}-50 border border-${color}-100 rounded-lg p-4`}>
    <div className="flex items-center justify-between">
      <div>
        <p className={`text-sm font-medium text-${color}-600`}>{label}</p>
        <p className={`text-2xl font-bold text-${color}-900 mt-1`}>{value}</p>
      </div>
      <span className={`material-icons text-${color}-400 text-3xl`}>
        {icon}
      </span>
    </div>
  </div>
);

const UserInfo = ({ name, lastActivity }) => (
  <div className="flex items-center gap-3">
    <div className="relative">
      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
        <span className="material-icons text-green-600 text-sm">person</span>
      </div>
      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
    </div>
    <div>
      <div className="font-medium text-gray-900">{name}</div>
      <div className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">
        Aktif: {lastActivity || "Baru saja"}
      </div>
    </div>
  </div>
);

// --- KOMPONEN UTAMA ---

export default function Online({ users = [] }) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => handleManualRefresh(), 30000);
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    router.reload({
      only: ["users"],
      onFinish: () => setIsRefreshing(false),
      preserveScroll: true,
    });
  };

  const handleForceLogout = (userId) => {
    if (confirm("Keluarkan user ini secara paksa?")) {
      router.post(
        route("admin.users.force-logout", userId),
        {},
        {
          onSuccess: () => alert("User berhasil dikeluarkan."),
        }
      );
    }
  };

  const columns = [
    {
      label: "Pengguna",
      key: "name",
      render: (val, row) => (
        <UserInfo name={val} lastActivity={row.last_activity} />
      ),
    },
    {
      label: "NPM",
      key: "npm",
      render: (val) => (
        <span className="font-mono text-sm text-gray-600 font-bold">{val}</span>
      ),
    },
    {
      label: "Alamat IP",
      key: "ip_address",
      render: (val) => (
        <code className="font-mono text-[11px] bg-gray-50 px-2 py-1 rounded border border-gray-200 text-gray-500">
          {val || "127.0.0.1"}
        </code>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden text-left">
      <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/30 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-blue-600 rounded-lg text-white">
            <span className="material-icons text-xl">sensors</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 uppercase tracking-tighter">
              Status Online
            </h1>
            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">
              Real-time Monitoring
            </p>
          </div>
        </div>
        <Button
          onClick={handleManualRefresh}
          loading={isRefreshing}
          className="bg-blue-600 text-xs">
          Muat Ulang Data
        </Button>
      </div>

      <div className="p-8">
        <OnlineStats count={users.length} />

        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-inner">
          <Table
            columns={columns}
            data={users}
            emptyMessage="Tidak ada pengguna yang online."
            renderActions={(user) => (
              <button
                onClick={() => handleForceLogout(user.id)}
                className="text-red-600 hover:bg-red-50 px-3 py-1 rounded-lg text-xs font-black uppercase transition-all">
                Logout Paksa
              </button>
            )}
          />
        </div>

        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
          <span className="material-icons text-amber-500">warning</span>
          <p className="text-xs text-amber-800 font-medium italic">
            Fitur Logout Paksa memutus sesi secara instan. Gunakan dengan bijak
            untuk menjaga integritas ujian.
          </p>
        </div>
      </div>
    </div>
  );
}
