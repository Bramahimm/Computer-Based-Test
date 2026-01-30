import React from "react";
import { router } from "@inertiajs/react";
import Button from "@/Components/UI/Button";

export default function Results({ results = [] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b bg-gray-50">
        <h1 className="text-xl font-bold text-gray-900">Hasil Ujian</h1>
        <p className="text-xs text-gray-500">
          Validasi hasil ujian peserta sebelum ditampilkan
        </p>
      </div>

      <div className="p-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left">Peserta</th>
              <th className="px-4 py-3 text-left">Ujian</th>
              <th className="px-4 py-3 text-center">Nilai</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {results.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-10 text-gray-400">
                  Belum ada hasil ujian
                </td>
              </tr>
            )}

            {results.map((row) => (
              <tr key={row.id} className="border-t">
                <td className="px-4 py-3">{row.user.name}</td>
                <td className="px-4 py-3">{row.test.title}</td>
                <td className="px-4 py-3 text-center font-bold">
                  {row.result.total_score}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      row.result.status === "validated"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {row.result.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {row.result.status === "pending" && (
                    <Button
  size="sm"
  onClick={() =>
    router.post(route("admin.results.validate", row.id))
  }
>
  Validasi
</Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
