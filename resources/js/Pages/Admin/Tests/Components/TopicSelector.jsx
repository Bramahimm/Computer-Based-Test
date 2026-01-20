import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, X, Check, BookOpen } from "lucide-react";

export default function TopicSelector({
  topics = [],
  selectedTopics = [],
  onChange,
  error,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  const selectedId = Array.isArray(selectedTopics)
    ? selectedTopics[0]
    : selectedTopics;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (id) => {
    onChange([id]);
    setIsOpen(false);
  };

  const currentTopic = topics.find((t) => t.id === selectedId);
  const filtered = topics.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-1 relative" ref={dropdownRef}>
      <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
        Pilih Mata Kuliah / Topik Soal
      </label>

      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-[42px] px-4 bg-white border rounded-xl flex items-center gap-3 cursor-pointer transition-all ${
          isOpen ? "border-blue-500 ring-4 ring-blue-500/5" : "border-gray-200"
        }`}>
        <BookOpen
          className={`w-4 h-4 ${
            currentTopic ? "text-blue-600" : "text-gray-400"
          }`}
        />
        <div className="flex-1 overflow-hidden">
          <span
            className={`text-xs ${
              currentTopic ? "font-bold text-gray-700" : "text-gray-400"
            }`}>
            {currentTopic ? currentTopic.name : "Pilih Mata Kuliah..."}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-[110] w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="p-2 border-b bg-gray-50/50">
            <input
              type="text"
              placeholder="Cari Mata Kuliah..."
              className="w-full px-3 py-2 bg-white border rounded-lg text-xs outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="max-h-52 overflow-y-auto custom-scrollbar p-1">
            {filtered.length > 0 ? (
              filtered.map((t) => (
                <div
                  key={t.id}
                  onClick={() => handleSelect(t.id)}
                  className={`flex flex-col px-3 py-2.5 rounded-xl cursor-pointer ${
                    t.id === selectedId
                      ? "bg-blue-50 text-blue-700"
                      : "hover:bg-gray-50 text-gray-600"
                  }`}>
                  <span className="text-xs font-bold uppercase">{t.name}</span>
                  <span className="text-[9px] opacity-60 font-black">
                    {t.questions_count || 0} Soal Tersedia
                  </span>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-gray-400">
                Tidak ada topik untuk grup ini
              </div>
            )}
          </div>
        </div>
      )}
      {error && <p className="text-[10px] text-red-500 font-bold">{error}</p>}
    </div>
  );
}
