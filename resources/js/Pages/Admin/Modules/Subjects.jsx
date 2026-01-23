import React, { useState } from "react";
import { router } from "@inertiajs/react";
import Button from "@/Components/UI/Button";
import {
  TrashIcon,
  PlusIcon,
  PencilIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function Subjects({ modules, topics }) {
  const [selectedModuleId, setSelectedModuleId] = useState(
    modules[0]?.id || ""
  );

  const [showModal, setShowModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const filteredTopics = topics.filter(
    (t) => t.module_id === Number(selectedModuleId)
  );

  /* =====================
   * CREATE / UPDATE
   * ===================== */
  const submit = (e) => {
    e.preventDefault();

    if (editingTopic) {
      // UPDATE
      router.put(
        route("admin.topics.update", editingTopic.id),
        {
          module_id: selectedModuleId,
          name: form.name,
          description: form.description,
          is_active: true,
        },
        {
          preserveScroll: true,
          onSuccess: () => resetModal(),
        }
      );
    } else {
      // CREATE
      router.post(
        route("admin.topics.store"),
        {
          module_id: selectedModuleId,
          name: form.name,
          description: form.description,
        },
        {
          preserveScroll: true,
          onSuccess: () => resetModal(),
        }
      );
    }
  };

  const resetModal = () => {
    setShowModal(false);
    setEditingTopic(null);
    setForm({ name: "", description: "" });
  };

  /* =====================
   * DELETE
   * ===================== */
  const destroy = (id) => {
    if (!confirm("Yakin ingin menghapus Topic ini? Semua Questions dalam Topic ini akan hilang.")) {
      return;
    }

    router.delete(route("admin.topics.destroy", id), {
      preserveScroll: true,
    });
  };

  /* =====================
   * EDIT
   * ===================== */
  const openEdit = (topic) => {
    setEditingTopic(topic);
    setForm({
      name: topic.name,
      description: topic.description ?? "",
    });
    setShowModal(true);
  };

  return (
    <>
      <div className="bg-white rounded-xl border">
        {/* HEADER */}
        <div className="p-6 border-b flex justify-between items-center">
          <div className="flex gap-3 items-center">
            <span className="text-sm font-bold">Class</span>
            <select
              className="border rounded px-3 py-1"
              value={selectedModuleId}
              onChange={(e) => setSelectedModuleId(e.target.value)}
            >
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <Button
            className="bg-green-600 flex gap-2"
            onClick={() => setShowModal(true)}
          >
            <PlusIcon className="w-4 h-4" />
            Tambah Topic
          </Button>
        </div>

        {/* LIST */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredTopics.length === 0 && (
            <p className="text-sm text-gray-400 italic">
              Tidak ada Topic pada Modul ini
            </p>
          )}

          {filteredTopics.map((s) => (
            <div
              key={s.id}
              className="border rounded-xl p-4 hover:border-green-500"
            >
              <div className="flex justify-between mb-2 items-start">
                <h3 className="font-bold">{s.name}</h3>

                <div className="flex gap-2">
                  <button onClick={() => openEdit(s)}>
                    <PencilIcon className="w-4 h-4 text-blue-500" />
                  </button>

                  <button onClick={() => destroy(s.id)}>
                    <TrashIcon className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-500">
                {s.questions_count ?? 0} Questions
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <form
            onSubmit={submit}
            className="bg-white rounded-xl w-full max-w-md p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">
                {editingTopic ? "Edit Topic" : "Tambah Topic"}
              </h2>
              <button type="button" onClick={resetModal}>
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold">Nama Topic</label>
                <input
                  required
                  className="w-full border rounded px-3 py-2"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-semibold">Deskripsi</label>
                <textarea
                  className="w-full border rounded px-3 py-2"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={resetModal}
              >
                Batal
              </Button>
              <Button type="submit" className="bg-green-600">
                {editingTopic ? "Update" : "Simpan"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
