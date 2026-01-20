import React, { useMemo } from "react";
import Button from "@/Components/UI/Button";
import { useForm, usePage } from "@inertiajs/react";
import { 
    CloudArrowUpIcon, DocumentTextIcon, CheckCircleIcon, 
    ExclamationCircleIcon, ArrowDownTrayIcon, InformationCircleIcon, 
    ArrowRightIcon, BookOpenIcon, FolderIcon 
} from "@heroicons/react/24/outline";

// Menggunakan Alert Import Soal yang sudah kita buat
import QuestionImportAlert from "@/Pages/Admin/Components/QuestionImportAlert";

// Terima props 'modules' dan 'topics' dari controller
export default function Import({ modules, topics }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    module_id: "", // State untuk menyimpan Modul yang dipilih
    topic_id: "",
    file: null,
  });

  const { flash } = usePage().props;

  // 🔥 LOGIC FILTERING: Hanya tampilkan topik yang sesuai dengan module_id yang dipilih
  const filteredTopics = useMemo(() => {
      if (!data.module_id) return []; // Jika belum pilih modul, topik kosong
      return topics.filter(t => t.module_id == data.module_id);
  }, [data.module_id, topics]);

  const handleFileUpload = (e) => setData("file", e.target.files[0]);

  const submitImport = (e) => {
    e.preventDefault();
    post(route("admin.import.questions"), {
      forceFormData: true,
      onSuccess: () => {
          reset('file'); 
          // Reset manual input file
          const fileInput = document.getElementById('file-upload');
          if(fileInput) fileInput.value = null;
      },
      onError: (errors) => {
          console.error("Import Error:", errors);
      }
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Import Bank Soal</h1>
          <p className="text-sm text-gray-500 mt-1">Unggah soal (Pilihan Ganda/Esai) via Excel ke Topik tertentu.</p>
        </div>
        <a href={route("admin.questions.import.template")} className="inline-flex items-center gap-2 bg-gray-800 text-white hover:bg-gray-700 px-5 py-2.5 rounded-lg text-sm font-bold shadow-md transition-all">
          <ArrowDownTrayIcon className="w-5 h-5" /> Unduh Template Soal
        </a>
      </div>

      <QuestionImportAlert flash={flash} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form Upload */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
               <CloudArrowUpIcon className="w-5 h-5 text-blue-600" />
               <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Area Upload</h2>
            </div>
            
            <div className="p-6 md:p-8">
              <form onSubmit={submitImport} className="space-y-6">
                
                {/* 1. PILIH MODUL (Baru) */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Pilih Modul <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <select 
                            value={data.module_id} 
                            onChange={(e) => {
                                setData(d => ({ ...d, module_id: e.target.value, topic_id: "" })); // Reset topic saat ganti modul
                            }} 
                            className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 pl-10 py-2.5 appearance-none bg-white"
                        >
                            <option value="">-- Silakan Pilih Modul --</option>
                            {modules.map((m) => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                        <FolderIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                    </div>
                </div>

                {/* 2. PILIH TOPIK (Filtered) */}
                <div className={`transition-all duration-300 ${!data.module_id ? 'opacity-50 pointer-events-none' : ''}`}>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Pilih Topik Tujuan <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <select 
                            value={data.topic_id} 
                            onChange={(e) => setData('topic_id', e.target.value)} 
                            disabled={!data.module_id} // Disable jika belum pilih modul
                            className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 pl-10 py-2.5 appearance-none bg-white disabled:bg-gray-100"
                        >
                            <option value="">
                                {data.module_id ? "-- Silakan Pilih Topik --" : "-- Pilih Modul Terlebih Dahulu --"}
                            </option>
                            {/* Render hasil filter */}
                            {filteredTopics.map((t) => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                        <BookOpenIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                    </div>
                    {errors.topic_id && <p className="text-red-500 text-sm mt-1">{errors.topic_id}</p>}
                </div>

                {/* 3. UPLOAD FILE */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">File Excel/CSV <span className="text-red-500">*</span></label>
                    <div className={`relative w-full border-2 border-dashed rounded-xl transition-all p-8 flex flex-col items-center justify-center text-center group ${data.file ? "border-emerald-400 bg-emerald-50/30" : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"}`}>
                        <input type="file" id="file-upload" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} />
                        {data.file ? (
                            <div className="animate-fade-in-up">
                                <DocumentTextIcon className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                                <p className="text-sm font-bold text-gray-900">{data.file.name}</p>
                                <p className="text-xs text-gray-500">{formatFileSize(data.file.size)}</p>
                                <div className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200"><CheckCircleIcon className="w-4 h-4" /> Siap Import</div>
                            </div>
                        ) : (
                            <div>
                                <CloudArrowUpIcon className="w-10 h-10 text-gray-400 mx-auto mb-2 group-hover:text-blue-500" />
                                <p className="text-sm font-medium text-gray-700"><span className="text-blue-600 font-bold hover:underline">Klik upload</span> atau drag file ke sini</p>
                                <p className="text-xs text-gray-400 mt-1">Format: .xlsx, .xls, .csv</p>
                            </div>
                        )}
                    </div>
                    {errors.file && <p className="text-red-500 text-sm mt-1">{errors.file}</p>}
                </div>

                {/* BUTTONS */}
                <div className="flex justify-end pt-4 border-t border-gray-100">
                    <Button type="submit" loading={processing} disabled={!data.file || !data.topic_id} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2">
                        {processing ? "Memproses..." : "Import Soal"}
                        {!processing && <ArrowRightIcon className="w-4 h-4" />}
                    </Button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
                    <InformationCircleIcon className="w-5 h-5 text-blue-500" />
                    <h3 className="font-bold text-gray-800 text-sm uppercase">Panduan Format</h3>
                </div>
                <ul className="space-y-4 text-sm text-gray-600">
                    <li className="flex gap-3"><div className="mt-0.5 w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 text-xs font-bold border border-blue-100">1</div><span>Gunakan template yang sudah disediakan.</span></li>
                    <li className="flex gap-3"><div className="mt-0.5 w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 text-xs font-bold border border-blue-100">2</div><span>Kolom Tipe Soal isi dengan: <code>pilihan_ganda</code> atau <code>esai</code>.</span></li>
                    <li className="flex gap-3"><div className="mt-0.5 w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 text-xs font-bold border border-blue-100">3</div><span>Kunci Jawaban PG wajib huruf tunggal (A/B/C/D/E).</span></li>
                    <li className="flex gap-3"><div className="mt-0.5 w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 text-xs font-bold border border-blue-100">4</div><span>Pilih <strong>Modul</strong> lalu <strong>Topik</strong> sebelum upload.</span></li>
                </ul>
            </div>
        </div>
      </div>
    </div>
  );
}