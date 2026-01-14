import React from "react";
// HAPUS import AdminLayout
import Table from "@/Components/UI/Table";
import Button from "@/Components/UI/Button";

// Menerima props 'users' (atau sesuaikan jika controller mengirim prop khusus hasil)
export default function Results({ users = [] }) {
  const columns = [
    { label: "Start Time", key: "start_time" },
    {
      label: "Duration",
      key: "duration",
      render: (val) => <span className="font-bold">{val || "0 min"}</span>,
    },
    {
      label: "Score",
      key: "score",
      render: (val) => (
        <span className="text-blue-600 font-black">{val || 0}%</span>
      ),
    },
    {
      label: "Correct",
      key: "correct",
      render: (val) => (
        <span className="text-green-600 font-bold">{val || 0}</span>
      ),
    },
    {
      label: "Wrong",
      key: "wrong",
      render: (val) => <span className="text-red-500">{val || 0}</span>,
    },
    {
      label: "Status",
      key: "status",
      render: (val) => (
        <span className="px-2 py-1 bg-gray-100 rounded text-[10px] uppercase font-bold">
          {val || "Unknown"}
        </span>
      ),
    },
  ];

  return (
    // HAPUS pembungkus AdminLayout
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden text-left">
      <div className="p-6 border-b border-gray-100 flex items-center gap-3">
        <div className="p-3 bg-blue-100 rounded-full text-blue-600">
          <span className="material-icons text-3xl">analytics</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-800 tracking-tight">
          Users
        </h1>
      </div>

      <div className="p-8">
        <h2 className="text-green-600 font-bold mb-4 uppercase">
          User Result Summary
        </h2>

        {/* Filter Section */}
        <div className="space-y-3 mb-8 bg-gray-50 p-6 rounded-xl border border-gray-200">
          <ResultFilter label="Group" icon="groups" />
          <ResultFilter label="User" icon="person" />
          <ResultFilter label="Test" icon="assignment" />
          <div className="flex md:ml-[120px] mt-4">
            <Button className="bg-blue-600 px-12 uppercase tracking-widest text-xs">
              Filter Data
            </Button>
          </div>
        </div>

        <Table
          columns={columns}
          data={users} // Menggunakan data dari props
          emptyMessage="No result records found for this criteria."
        />

        {/* Export Section */}
        <div className="mt-8 flex flex-col items-center gap-3 border-t pt-8">
          <p className="text-blue-600 font-black text-xs uppercase tracking-tighter">
            Export Results
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button className="bg-red-500 px-8 text-xs font-bold">
              PDF REPORT
            </Button>
            <Button className="bg-green-600 px-8 text-xs font-bold">
              EXCEL/CSV
            </Button>
            <Button className="bg-[#00a65a] px-8 text-xs font-bold">
              TCExam XML
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-komponen Filter tetap dipertahankan namun tanpa layout luar
const ResultFilter = ({ label, icon }) => (
  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
    <label className="text-sm font-bold text-green-700 md:w-24 flex items-center gap-2">
      <span className="material-icons text-sm">{icon}</span>
      {label}
    </label>
    <div className="flex-1 max-w-xl">
      <input
        className="w-full border border-gray-300 p-2 rounded-lg outline-none focus:ring-2 focus:ring-green-500 transition-all shadow-inner bg-white text-sm"
        placeholder={`Filter by ${label}...`}
      />
    </div>
  </div>
);
