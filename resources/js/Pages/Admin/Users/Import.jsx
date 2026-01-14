import React from "react";
// HAPUS import AdminLayout
import Button from "@/Components/UI/Button";
import { useForm } from "@inertiajs/react";

export default function Import() {
  // Inisialisasi useForm untuk handle file upload
  const { data, setData, post, processing, errors, reset } = useForm({
    file: null,
  });

  const handleFileUpload = (e) => {
    setData("file", e.target.files[0]);
  };

  const submitImport = (e) => {
    e.preventDefault();
    // Sesuaikan dengan route di admin.php: admin.import.users
    post(route("admin.import.users"), {
      forceFormData: true, // Wajib untuk upload file
      onSuccess: () => reset(),
    });
  };

  return (
    // HAPUS pembungkus AdminLayout
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden text-left">
      <div className="p-8">
        <h2 className="text-lg font-bold mb-4">Import Mahasiswa</h2>

        <div className="max-w-4xl mx-auto border border-gray-300 rounded-lg p-10 bg-gray-50/50">
          <form onSubmit={submitImport} className="text-center space-y-4">
            <p className="text-blue-600 font-bold text-sm">Upload File</p>

            <div
              className={`border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center bg-white transition-colors ${
                data.file ? "border-green-500 bg-green-50" : "border-gray-400"
              }`}>
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".csv,.xml"
                onChange={handleFileUpload}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer text-center w-full">
                <span className="material-icons text-4xl text-gray-400 mb-2">
                  cloud_upload
                </span>
                <p className="text-gray-400 text-xs font-bold leading-relaxed">
                  {data.file ? (
                    <span className="text-green-600 font-black">
                      {data.file.name}
                    </span>
                  ) : (
                    <>
                      Tarik atau seret
                      <br />
                      CSV atau XML
                    </>
                  )}
                </p>
              </label>
            </div>

            {errors.file && (
              <p className="text-red-500 text-xs font-bold">{errors.file}</p>
            )}

            <div className="flex justify-center gap-4 mt-8">
              <Button
                type="submit"
                loading={processing}
                disabled={!data.file}
                className="bg-[#00a65a] px-12">
                Import Data
              </Button>
              <Button
                type="button"
                variant="danger"
                className="px-12"
                onClick={() => reset()}>
                Reset
              </Button>
            </div>
          </form>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 p-3 rounded text-sm text-blue-700 italic">
          Dengan formulir ini Anda dapat mengimpor pengguna terdaftar dari file
          XML atau CSV. Pastikan file tersebut mengikuti templat yang
          dibutuhkan..
        </div>
      </div>
    </div>
  );
}
