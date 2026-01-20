import React from "react";
import { getColumns } from "../Config/TableColumns";

export default function TestTable({ tests, onEdit, onDelete }) {
  const columns = getColumns();
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-100 uppercase text-[10px] font-black text-gray-400 tracking-widest">
            {columns.map((col) => (
              <th key={col.key} className={`px-4 py-4 ${col.className}`}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {tests.map((test) => (
            <tr
              key={test.id}
              className="hover:bg-gray-50/50 transition-all text-xs">
              <td className="px-4 py-4 font-bold uppercase">{test.title}</td>
              <td className="px-4 py-4 text-[10px] font-mono leading-tight">
                <span className="text-blue-600 font-black">START:</span>{" "}
                {test.start_time}
                <br />
                <span className="text-red-600 font-black">END:</span>{" "}
                {test.end_time}
              </td>
              <td className="px-4 py-4 text-center font-bold text-gray-500">
                {test.duration}m
              </td>
              <td className="px-4 py-4 text-center">
                <span
                  className={`px-2 py-1 rounded text-[9px] font-black ${
                    test.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}>
                  {test.is_active ? "AKTIF" : "NON-AKTIF"}
                </span>
              </td>
              <td className="px-4 py-4 text-right">
                <button
                  onClick={() => onEdit(test)}
                  className="text-blue-600 mr-4 font-black uppercase text-[10px] hover:underline">
                  Edit
                </button>
                <button
                  onClick={() => onDelete(test.id)}
                  className="text-red-500 font-black uppercase text-[10px] hover:underline">
                  Hapus
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
