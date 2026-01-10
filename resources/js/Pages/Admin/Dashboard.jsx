import React from "react";
import { Head } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";

export default function Dashboard({ stats }) {
  const {
    totalUsers = 0,
    totalTests = 0,
    activeTests = 0,
    ongoingTests = 0,
  } = stats;

  return (
    <AdminLayout pageTitle="CBT / Admin / Dashboard">
      <Head title="Dashboard Admin" />

      <div className="space-y-8">
        <h1 className="text-2xl font-semibold text-slate-800">
          Dashboard Admin
        </h1>

        {/* KPI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {[
            ["Total Peserta", totalUsers],
            ["Total Ujian", totalTests],
            ["Ujian Aktif", activeTests],
            ["Sedang Berlangsung", ongoingTests],
          ].map(([label, value], i) => (
            <div
              key={i}
              className="bg-white border rounded-2xl p-6 shadow-sm"
            >
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-2 text-3xl font-bold text-slate-800">
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* INFO */}
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <p className="text-sm text-slate-600">
            Gunakan menu di samping untuk mengelola peserta, soal,
            modul ujian, serta memantau ujian yang sedang berlangsung.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
