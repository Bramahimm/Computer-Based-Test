import React from "react";
import Table from "@/Components/UI/Table";
import { getColumns } from "../Config/TableColumns";
import Button from "@/Components/UI/Button";

export default function TestTable({
  tests,
  onEdit,
  onDelete,
  isLoading = false,
}) {
  const columns = getColumns().map((col) => {
    if (col.key === "duration") {
      return {
        ...col,
        render: (value) => `${value}m`,
      };
    }

    if (col.key === "is_active") {
      return {
        ...col,
        render: (value) => (
          <span
            className={`px-2 py-1 rounded text-[9px] font-bold ${
              value ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}>
            {value ? "AKTIF" : "NON-AKTIF"}
          </span>
        ),
      };
    }

    if (["start_time", "end_time"].includes(col.key)) {
      return {
        ...col,
        render: (value) => (
          <span className="text-[12px] font-mono leading-tight">{value}</span>
        ),
      };
    }

    return col;
  });

  const renderActions = (row) => (
    <div className="flex gap-1">
      <Button
        variant="primary"
        onClick={(e) => {
          e.stopPropagation();
          onEdit(row);
        }}
        className="text-[6px] py-1 px-2">
        Edit
      </Button>
      <Button
        variant="danger"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(row.id);
        }}
        className="text-[10px] py-1 px-1 bg-black">
        Hapus
      </Button>
    </div>
  );

  return (
    <Table
      columns={columns}
      data={tests}
      isLoading={isLoading}
      emptyMessage="Belum ada ujian tersedia"
      renderActions={renderActions}
    />
  );
}
