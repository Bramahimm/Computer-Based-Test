// resources/js/Pages/Admin/Tests/Components/TestForm.jsx

import React, { useState } from "react";
import Input from "@/Components/UI/Input";
import GroupSelector from "./GroupSelector";
import TopicSelector from "./TopicSelector";
import ScoringTab from "./Advanced/ScoringTab";
import BehaviorTab from "./Advanced/BehaviorTab";
import ModuleSelector from "./ModuleSelector";

export default function TestForm({
  data,
  setData,
  errors,
  groups,
  topics,
  modules,
}) {
  const [tab, setTab] = useState(0);
  const menus = ["Konfigurasi Utama", "Lanjutan"];

  return (
    <div className="flex flex-col h-full max-h-[600px]">
      {/* TAB HEADER - Tetap di atas */}
      <div className="relative flex gap-8 border-b border-gray-100 px-2 shrink-0">
        {menus.map((m, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setTab(i)}
            className={`pb-3 text-[13px] font-bold transition-all duration-300 relative ${
              tab === i ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
            }`}>
            {m}
            {/* Underline Animasi yang mengalir */}
            {tab === i && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 animate-in slide-in-from-left-full duration-300" />
            )}
          </button>
        ))}
      </div>

      {/* CONTENT SLIDER CONTAINER - Dikunci tingginya */}
      <div className="flex-1 overflow-hidden relative mt-6 min-h-[650px] pb-20">
        {/* TAB 0: UTAMA (Geser ke kiri saat tidak aktif) */}
        <div
          className={`absolute inset-0 w-full transition-all duration-500 ease-in-out transform ${
            tab === 0
              ? "translate-x-0 opacity-100 invisible-none"
              : "-translate-x-full opacity-0 pointer-events-none"
          }`}>
          <div className="space-y-4 pr-1">
            <Input
              label="Judul Ujian"bata
              value={data.title}
              onChange={(e) => setData("title", e.target.value)}
              error={errors.title}
              placeholder="Contoh: Ujian Tengah Semester Ganjil"
              className="bg-black"
            />

            <div className="space-y-1">
              <label className="text-[13px] font-bold">Deskripsi Ujian</label>
              <textarea
                value={data.description || ""}
                onChange={(e) => setData("description", e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-blue-500 min-h-[60px] max-h-[60px] resize-none"
                placeholder="Tulis deskripsi ujian di sini"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
              {/* 1. Pilih Module (Kelompok Besar) */}
              <ModuleSelector
                modules={modules || []} // Handling jika data kosong
                value={data.module_id}
                onChange={(val) => {
                  setData((prev) => ({
                    ...prev,
                    module_id: val,
                    topics: [], // Reset topik saat modul berubah
                  }));
                }}
                error={errors.module_id}
              />

              {/* 2. Pilih Topic (Hanya muncul jika Module dipilih) */}
              <TopicSelector
                topics={(topics || []).filter(
                  (t) => t.module_id === data.module_id
                )}
                selectedTopics={data.topics}
                onChange={(val) => setData("topics", val)} // Val akan berisi 1 ID dalam array
                error={errors.topics}
                disabled={!data.module_id}
              />
            </div>

            {/* 3. Otorisasi Target Mahasiswa (Wajib 1 Group) */}
            <div className="p-4 bg-blue-50/30 rounded-2xl border border-blue-100/50">
              <GroupSelector
                groups={groups || []}
                selectedGroups={data.groups}
                onChange={(val) => setData("groups", val)} // Single select handling
                error={errors.groups}
              />
              <p className="mt-2 text-[9.4px] text-green-600 font-bold">
                * Ujian hanya akan muncul pada dashboard mahasiswa di grup ini
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Waktu Mulai"
                type="datetime-local"
                value={data.start_time}
                onChange={(e) => setData("start_time", e.target.value)}
                error={errors.start_time}
              />
              <Input
                label="Waktu Selesai"
                type="datetime-local"
                value={data.end_time}
                onChange={(e) => setData("end_time", e.target.value)}
                error={errors.end_time}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Durasi (Menit)"
                type="number"
                value={data.duration}
                onChange={(e) => setData("duration", e.target.value)}
              />
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-500 uppercase">
                  Status
                </label>
                <select
                  value={data.is_active}
                  onChange={(e) => setData("is_active", e.target.value)}
                  className="w-full border border-gray-200 p-2.5 rounded-xl text-xs font-bold">
                  <option value={1}>PUBLISH</option>
                  <option value={0}>DRAFT</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* TAB 1: LANJUTAN (Geser dari kanan saat aktif) */}
        <div
          className={`absolute inset-0 w-full transition-all duration-500 ease-in-out transform ${
            tab === 1
              ? "translate-x-0 opacity-100"
              : "translate-x-full opacity-0 pointer-events-none"
          }`}>
          <div className="space-y-6 pr-1">
            <div className="space-y-4">
              <h4 className="text-[15px] font-bold pb-2">
                Pengaturan Skor
              </h4>
              <ScoringTab data={data} setData={setData} errors={errors} />
            </div>
            <div className="space-y-4">
              <h4 className="text-[15px] font-bold pb-2">
                Penilaian
              </h4>
              <BehaviorTab data={data} setData={setData} errors={errors} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
