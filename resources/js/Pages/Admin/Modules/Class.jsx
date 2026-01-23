import React, { useState } from "react";
import { useForm } from "@inertiajs/react";
import Button from "@/Components/UI/Button";
import Modal from "@/Components/UI/Modal";

import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/solid";

export default function Class({ modules }) {
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const { data, setData, post, put, delete: destroy, processing, reset } =
    useForm({
      name: "",
      description: "",
    });

  /* ================= OPEN MODAL ================= */
  const openCreate = () => {
    reset();
    setEditId(null);
    setIsOpen(true);
  };

  const openEdit = (item) => {
    setEditId(item.id);
    setData({
      name: item.name,
      description: item.description ?? "",
    });
    setIsOpen(true);
  };

  /* ================= SUBMIT ================= */
  const submit = (e) => {
    e.preventDefault();

    if (editId) {
      put(route("admin.modules.update", editId), {
        onSuccess: () => setIsOpen(false),
      });
    } else {
      post(route("admin.modules.store"), {
        onSuccess: () => setIsOpen(false),
      });
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = (id) => {
    if (!confirm("Yakin ingin menghapus kelas ini?")) return;

    destroy(route("admin.modules.destroy", id));
  };

  return (
    <>
      {/* ================= HEADER ================= */}
      <div className="bg-white rounded-xl border shadow-sm">
        <div className="p-6 border-b flex justify-between items-center">
          <div className="flex items-center gap-3">
            <AcademicCapIcon className="w-7 h-7 text-emerald-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Manajemen Modul
              </h2>
              <p className="text-sm text-gray-500">
                Halaman Manajemen Akademik Fakultas Kedokteran
              </p>
            </div>
          </div>

          <Button
            onClick={openCreate}
            className="bg-emerald-600 flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Tambahkan Modul
          </Button>
        </div>

        {/* ================= TABLE ================= */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-4 text-left">Nama Modul</th>
                <th className="px-6 py-4 text-left">Deskripsi</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {modules.length === 0 ? (
                <tr>
                  <td
                    colSpan="3"
                    className="px-6 py-10 text-center text-gray-400"
                  >
                    Tidak ada modul yang ditemukan
                  </td>
                </tr>
              ) : (
                modules.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {item.description || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(item)}
                          className="p-2 rounded-lg border hover:bg-blue-50 text-blue-600"
                        >
                          <PencilSquareIcon className="w-5 h-5" />
                        </button>

                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 rounded-lg border hover:bg-red-50 text-red-600"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL ================= */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={editId ? "Edit Modul" : "Tambah Modul"}
      >
        <form onSubmit={submit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Nama Modul
            </label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => setData("name", e.target.value)}
              className="w-full rounded-lg border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Deskripsi
            </label>
            <textarea
              rows="3"
              value={data.description}
              onChange={(e) => setData("description", e.target.value)}
              className="w-full rounded-lg border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Batal
            </Button>

            <Button
              type="submit"
              loading={processing}
              className="bg-emerald-600"
            >
              {editId ? "Update" : "Simpan"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
