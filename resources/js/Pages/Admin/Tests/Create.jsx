import React from "react";
import { Head, useForm } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import TestForm from "./Components/TestForm";

export default function Create({ groups, topics }) {
  const { data, setData, post, processing, errors } = useForm({
    title: "",
    description: "",
    duration: 60,
    start_time: "",
    end_time: "",
    is_active: 1,
    groups: [],
    topics: [],
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route("admin.tests.store"));
  };

  return (
    <AdminLayout>
      <Head title="Buat Ujian Baru" />
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <TestForm
          data={data}
          setData={setData}
          errors={errors}
          processing={processing}
          groups={groups}
          topics={topics}
          submit={handleSubmit}
        />
      </div>
    </AdminLayout>
  );
}
