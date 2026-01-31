import React, { useState, useMemo } from "react";
import { router, usePage } from "@inertiajs/react";
import { CheckSquare, Square } from "lucide-react";
import Table from "@/Components/UI/Table";
import Pagination from "@/Components/UI/Pagination";
import DataFilter from "@/Components/Shared/DataFilter";
import SelectionHeader from "./Selection-Components/SelectionHeader";
import AssignGroupModal from "./Selection-Components/AssignGroupModal";

export default function Selection({ users, groups }) {
  const { filters } = usePage().props;

  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [params, setParams] = useState({
    search: filters?.search || "",
    group_id: filters?.group_id || "",
  });

  // logic selection
  const allIdsOnPage = users.data ? users.data.map((u) => u.id) : [];
  const isAllSelected =
    allIdsOnPage.length > 0 &&
    allIdsOnPage.every((id) => selectedUserIds.includes(id));

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedUserIds((prev) =>
        prev.filter((id) => !allIdsOnPage.includes(id)),
      );
    } else {
      const newSet = new Set([...selectedUserIds, ...allIdsOnPage]);
      setSelectedUserIds(Array.from(newSet));
    }
  };

  const handleSelectOne = (id) => {
    setSelectedUserIds((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id],
    );
  };

  // logic assignment
  const handleConfirmAssign = (targetGroupIds) => {
    setIsProcessing(true);
    router.post(
      route("admin.users.assign-groups"),
      {
        user_ids: selectedUserIds,
        group_ids: targetGroupIds,
      },
      {
        onSuccess: () => {
          setIsModalOpen(false);
          setSelectedUserIds([]);
          setIsProcessing(false);
        },
        onError: () => setIsProcessing(false),
      },
    );
  };

  // logic filter
  const refreshData = (newParams) => {
    setParams(newParams);
    setSelectedUserIds([]);
    router.get(
      route("admin.users.index"),
      { ...newParams, section: "selection" },
      { preserveState: true, preserveScroll: true, replace: true },
    );
  };

  const columns = useMemo(
    () => [
      {
        label: (
          <div
            className="flex justify-center cursor-pointer"
            onClick={handleSelectAll}>
            {isAllSelected ? (
              <CheckSquare className="w-5 h-5 text-indigo-600" />
            ) : (
              <Square className="w-5 h-5 text-gray-300" />
            )}
          </div>
        ),
        key: "select",
        className: "w-12 text-center",
        render: (_, row) => (
          <div
            className="flex justify-center items-center cursor-pointer p-1"
            onClick={() => handleSelectOne(row.id)}>
            {selectedUserIds.includes(row.id) ? (
              <CheckSquare className="w-5 h-5 text-indigo-600" />
            ) : (
              <Square className="w-5 h-5 text-gray-300 hover:text-gray-400" />
            )}
          </div>
        ),
      },
      {
        label: "NPM",
        key: "npm",
        className: "font-mono text-sm w-32",
        render: (v) => <span className="text-gray-600">{v || "-"}</span>,
      },
      {
        label: "Nama Lengkap",
        key: "name",
        className: "font-semibold text-gray-800",
        render: (v, r) => (
          <span
            className={
              selectedUserIds.includes(r.id) ? "text-indigo-700 font-bold" : ""
            }>
            {v}
          </span>
        ),
      },
      {
        label: "Grup Saat Ini",
        key: "groups",
        render: (g) =>
          g && g.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {g.map((i) => (
                <span
                  key={i.id}
                  className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold border border-gray-200">
                  {i.name}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-gray-400 italic text-xs">-</span>
          ),
      },
      { label: "Email", key: "email", className: "text-gray-500 text-xs" },
    ],
    [selectedUserIds, isAllSelected, users.data],
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header Component */}
      <SelectionHeader
        totalUsers={users.total || 0}
        selectedCount={selectedUserIds.length}
        onAssignClick={() => setIsModalOpen(true)}
      />

      <div className="p-6">
        {/* Filter Logic */}
        <DataFilter
          searchPlaceholder="Cari nama atau NPM..."
          searchValue={params.search}
          onSearchChange={(val) => {
            setParams((p) => ({ ...p, search: val }));
            // Logic debounce search bisa tetap disini atau pindah ke custom hook
            clearTimeout(window.searchTimeout);
            window.searchTimeout = setTimeout(() => {
              router.get(
                route("admin.users.index"),
                { ...params, search: val, section: "selection" },
                { preserveState: true, replace: true },
              );
            }, 400);
          }}
          filters={[
            {
              label: "Filter Grup Asal",
              value: params.group_id,
              options: groups.map((g) => ({ value: g.id, label: g.name })),
              onChange: (val) => refreshData({ ...params, group_id: val }),
            },
          ]}
          onReset={() => refreshData({ search: "", group_id: "" })}
        />

        {/* Table & Pagination */}
        <Table
          data={users.data || []}
          emptyMessage="Tidak ada pengguna ditemukan"
          columns={columns}
        />
        <div className="mt-4">
          {users.links && <Pagination links={users.links} />}
        </div>
      </div>

      {/* Modal Component */}
      <AssignGroupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        groups={groups}
        selectedCount={selectedUserIds.length}
        onConfirm={handleConfirmAssign}
        isLoading={isProcessing}
      />
    </div>
  );
}
