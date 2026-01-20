import React, { useState } from "react";
import { useForm, router } from "@inertiajs/react";
import Modal from "@/Components/UI/Modal";
import Button from "@/Components/UI/Button";
import TestTable from "./TestTable";
import TestForm from "./TestForm";
import { initialForm, transformForEdit } from "../Config/FormSchema";

export default function Management({
  tests = [],
  groups = [],
  topics = [],
  modules = [],
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

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
  transform((data) => ({
    ...data,
    start_time: data.start_time ? data.start_time.replace("T", " ") : null,
    description: data.description || "",
    end_time: data.end_time ? data.end_time.replace("T", " ") : null,
    groups: Array.isArray(data.groups) ? data.groups : [],
    topics: Array.isArray(data.topics) 
    ? data.topics.map(id => ({
        id: id,
        total_questions: 10,
        question_type: 'mixed'
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

    console.log("Data in State:", data);

    const options = {
      onSuccess: () => {
        setIsModalOpen(false);
        reset();
      },
      onError: (err) => console.error("Validation Errors:", err),
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
          <h1 className="text-xl font-bold text-gray-900 ">Manajemen Ujian</h1>
          <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">
            Kelola Daftar & Konfigurasi CBT
          </p>
        </div>
        <Button
          onClick={() => openModal()}
          className="bg-blue-600 text-xs font-bold uppercase tracking-widest px-8">
          + Ujian
        </Button>
      </div>

      <div className="p-8">
        <TestTable
          tests={tests}
          onEdit={openModal}
          onDelete={(id) =>
            confirm("Hapus?") && router.delete(route("admin.tests.destroy", id))
          }
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editMode ? "Edit Ujian" : "Tambah Ujian"}
        size="lg">
        <form onSubmit={handleSubmit} className="p-1">
          <TestForm
            data={data}
            setData={setData}
            errors={errors}
            groups={groups}
            topics={topics}
            modules={modules}
          />
          <div className="flex justify-end gap-3 pt-6 border-t mt-32">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button
              type="submit"
              loading={processing}
              className="bg-blue-600 px-10">
              Simpan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
