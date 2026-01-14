import React from "react";
import { Head, useForm } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import UserForm from "@/Features/UserManagement/Components/UserForm";
import Button from "@/Components/UI/Button";

export default function Edit({ user, groups }) {
  const { data, setData, put, processing, errors } = useForm({
    name: user.name || "",
    npm: user.npm || "",
    email: user.email || "",
    groups: user.groups ? user.groups.map((g) => g.id) : [],
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    put(route("admin.users.update", user.id));
  };

  return (
    <AdminLayout>
      <Head title="Edit Peserta" />
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border">
        <h1 className="text-xl font-black mb-6 uppercase">
          Halaman Edit Peserta
        </h1>
        <form onSubmit={handleSubmit}>
          <UserForm
            data={data}
            setData={setData}
            errors={errors}
            groups={groups}
          />
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}>
              Kembali
            </Button>
            <Button type="submit" loading={processing} className="bg-[#00a65a]">
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
