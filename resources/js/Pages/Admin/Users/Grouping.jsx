import React, { useState, useEffect } from "react";
import { useForm, usePage } from "@inertiajs/react";
import Button from "@/Components/UI/Button";
import Table from "@/Components/UI/Table";
import Modal from "@/Components/UI/Modal";
import Input from "@/Components/UI/Input";

// --- SUB-KOMPONEN KECIL (STYLING & UI) ---

const GroupHeader = ({ onAdd, count }) => (
  <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/30 flex items-center justify-between">
    <div className="flex items-center gap-4">
      <div className="p-2.5">
        <span className="material-icons">workspaces</span>
      </div>
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Manajemen Grup
        </h1>
        <p className="text-[11px] text-gray-500 font-semibold">
          {count} Grup Terdaftar
        </p>
      </div>
    </div>
    <Button
      onClick={onAdd}
      className="bg-green-600 font-semibold hover:bg-green-700 flex items-center gap-1 text-xs">
      <span className="material-icons text-sm">add</span> Tambah Grup
    </Button>
  </div>
);

const GroupFlash = ({ message }) => (
  <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-r-xl shadow-sm animate-in slide-in-from-top duration-300">
    <div className="flex items-center gap-3">
      <span className="material-icons text-green-500">check_circle</span>
      <p className="text-sm font-medium">{message}</p>
    </div>
  </div>
);

// --- KOMPONEN UTAMA ---

export default function Grouping({ groups = [] }) {
  const { props } = usePage();
  const { flash } = props;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [showFlash, setShowFlash] = useState(false);

  // Logic Flash Message & LocalStorage Recovery
  useEffect(() => {
    const savedMessage = localStorage.getItem("group_flash");
    if (flash?.success || savedMessage) {
      if (savedMessage && !flash?.success) flash.success = savedMessage;
      setShowFlash(true);
      localStorage.removeItem("group_flash");
      const timer = setTimeout(() => setShowFlash(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [flash]);

  const {
    data,
    setData,
    post,
    put,
    delete: destroy,
    processing,
    errors,
    reset,
    clearErrors,
  } = useForm({
    name: "",
    description: "",
  });

  // Handlers
  const handleOpenModal = (group = null) => {
    clearErrors();
    if (group) {
      setEditMode(true);
      setSelectedId(group.id);
      setData({ name: group.name, description: group.description || "" });
    } else {
      setEditMode(false);
      reset();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const options = {
      preserveScroll: true,
      onSuccess: () => {
        localStorage.setItem(
          "group_flash",
          editMode ? "Grup diperbarui" : "Grup ditambahkan"
        );
        setIsModalOpen(false);
        reset();
      },
    };
    editMode
      ? put(route("admin.groups.update", selectedId), options)
      : post(route("admin.groups.store"), options);
  };

  const handleDelete = (id) => {
    if (confirm("Hapus grup ini secara permanen?")) {
      destroy(route("admin.groups.destroy", id), { preserveScroll: true });
    }
  };

  const columns = [
    { label: "Nama Grup", key: "name", className: "font-bold text-gray-800" },
    {
      label: "Keterangan",
      key: "description",
      className: "text-gray-500 italic text-xs",
    },
    {
      label: "Dibuat pada",
      key: "created_at",
      render: (v) => (
        <span className="text-[10px] font-mono">
          {v ? new Date(v).toLocaleDateString("id-ID") : "-"}
        </span>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden text-left">
      <GroupHeader onAdd={() => handleOpenModal()} count={groups.length} />

      <div className="p-8">
        {showFlash && flash?.success && <GroupFlash message={flash.success} />}

        <Table
          columns={columns}
          data={groups}
          emptyMessage="Belum ada grup yang dibuat."
          renderActions={(group) => (
            <div className="flex gap-2">
              <button
                onClick={() => handleOpenModal(group)}
                className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-all">
                <span className="material-icons text-sm">edit</span>
              </button>
              <button
                onClick={() => handleDelete(group.id)}
                className="text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-all">
                <span className="material-icons text-sm">delete</span>
              </button>
            </div>
          )}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editMode ? "Edit Grup" : "Tambah Grup"}>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <Input
            label="Nama Grup"
            value={data.name}
            onChange={(e) => setData("name", e.target.value)}
            error={errors.name}
            placeholder={"masukkan nama mahasiswa"}
            required
          />
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">
              Keterangan
            </label>
            <textarea
              className={`w-full border p-3 rounded-xl text-sm min-h-[100px] outline-none focus:ring-2 focus:ring-green-500 ${
                errors.description ? "border-red-500" : "border-gray-200"
              }`}
              value={data.description}
              onChange={(e) => setData("description", e.target.value)}
            placeholder={"masukkan sedikit deskripsi"}

            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button
              type="submit"
              loading={processing}
              className="bg-green-600 px-8">
              Simpan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
