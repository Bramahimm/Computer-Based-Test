import React, { useState, useMemo } from "react";
import { useForm, router, usePage } from "@inertiajs/react"; // Tambah usePage & router
import Modal from "@/Components/UI/Modal";
import Button from "@/Components/UI/Button";
import TestTable from "./TestTable";
import TestForm from "./TestForm";
import DataFilter from "@/Components/Shared/DataFilter"; // Import DataFilter
import { initialForm, transformForEdit } from "../Config/FormSchema";

export default function Management({
  tests, // Sekarang ini adalah object Pagination (data, links, meta)
  groups,
  topics,
  modules,
}) {
  // 1. Ambil state filters dari Backend (agar sinkron saat refresh)
  const { filters } = usePage().props;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // State lokal untuk filter UI
  const [params, setParams] = useState({
    search: filters?.search || "",
    module_id: filters?.module_id || "",
    group_id: filters?.group_id || "",
  });

  // 2. Logic Trigger Filter ke Backend
  const refreshData = (newParams) => {
    setParams(newParams);
    router.get(route("admin.tests.index"), newParams, {
      preserveState: true,
      preserveScroll: true,
      replace: true, // Agar history browser tidak penuh sampah ketikan
    });
  };

  // 3. Konfigurasi Filter untuk DataFilter.jsx
  // Menggunakan useMemo agar tidak re-render berlebihan
  const filterConfig = useMemo(
    () => [
      {
        label: "Modul",
        value: params.module_id,
        options: modules.map((m) => ({ value: m.id, label: m.name })),
        onChange: (val) => refreshData({ ...params, module_id: val }),
      },
      {
        label: "Target Grup",
        value: params.group_id,
        options: groups.map((g) => ({ value: g.id, label: g.name })),
        onChange: (val) => refreshData({ ...params, group_id: val }),
      },
    ],
    [params, modules, groups],
  );

  // Handler Search (Debounce manual sederhana)
  const onSearch = (val) => {
    setParams((prev) => ({ ...prev, search: val }));

    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      router.get(
        route("admin.tests.index"),
        { ...params, search: val },
        {
          preserveState: true,
          preserveScroll: true,
          replace: true,
        },
      );
    }, 400); // Delay 400ms
  };

  // --- Logic Modal & Form (Kode Lama Anda) ---
  const {
    data,
    setData,
    post,
    put,
    processing,
    errors,
    reset,
    clearErrors,
    transform,
  } = useForm(initialForm);

  // Transform Data sebelum Submit
  transform((data) => ({
    ...data,
    start_time: data.start_time ? data.start_time.replace("T", " ") : null,
    end_time: data.end_time ? data.end_time.replace("T", " ") : null,
    description: data.description || "",
    groups: Array.isArray(data.groups) ? data.groups : [],
    topics: Array.isArray(data.topics)
      ? data.topics.map((id) => ({
          id: id,
          total_questions: 10, // Default value, idealnya dinamis
          question_type: "mixed",
        }))
      : [],
  }));

  const openModal = (test = null) => {
    clearErrors();
    if (test) {
      setEditMode(true);
      setSelectedId(test.id);
      setData(transformForEdit(test));
    } else {
      setEditMode(false);
      reset();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const options = {
      onSuccess: () => {
        setIsModalOpen(false);
        reset();
      },
      preserveScroll: true,
    };

    if (editMode) {
      put(route("admin.tests.update", selectedId), options);
    } else {
      post(route("admin.tests.store"), options);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden text-left">
      <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/30 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Manajemen Ujian</h1>
          <p className="text-[11px] text-gray-500 font-semibold">
            Kelola Daftar & Konfigurasi CBT
          </p>
        </div>
        <Button
          onClick={() => openModal()}
          className="bg-gradient-to-r bg-green-600 text-white text-xs font-bold px-6">
          Tambah Ujian
        </Button>
      </div>

      <div className="p-8">
        {/* IMPLEMENTASI FILTER DINAMIS */}
        <DataFilter
          searchPlaceholder="Cari judul ujian..."
          searchValue={params.search}
          onSearchChange={onSearch}
          filters={filterConfig}
          onReset={() =>
            refreshData({ search: "", module_id: "", group_id: "" })
          }
        />

        {/* Tabel Data (Support Pagination Object) */}
        <TestTable
          tests={tests.data || []} // Handle data dari pagination
          onEdit={openModal}
          onDelete={(id) =>
            confirm("Hapus ujian ini beserta seluruh data nilainya?") &&
            router.delete(route("admin.tests.destroy", id))
          }
        />

        {/* Tambahkan Pagination Controls disini nanti jika perlu */}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editMode ? "Edit Ujian" : "Tambah Ujian"}
        size="lg">
        <form onSubmit={handleSubmit} className="p-1">
          {/* WRAPPING TOMBOL KE DALAM TESTFORM */}
          <TestForm
            data={data}
            setData={setData}
            errors={errors}
            groups={groups}
            topics={topics}
            modules={modules}>
            {/* ANAK (CHILDREN) MULAI DISINI */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}>
                Batal
              </Button>
              <Button
                type="submit"
                loading={processing}
                className="bg-green-600 px-8 text-white">
                Simpan
              </Button>
            </div>
            {/* ANAK SELESAI */}
          </TestForm>
        </form>
      </Modal>
    </div>
  );
}
