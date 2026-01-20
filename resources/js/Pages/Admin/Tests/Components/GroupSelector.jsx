import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, X, Check, Users } from "lucide-react";

export default function GroupSelector({
  selectedGroups = [],
  onChange,
  groups = [],
  error,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // Jika data dari parent berupa array [id], kita ambil indeks ke-0
  const selectedId = Array.isArray(selectedGroups)
    ? selectedGroups[0]
    : selectedGroups;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (id) => {
    onChange([id]);
    setIsOpen(false);
    setSearchTerm("");
  };

  const clearSelection = (e) => {
    e.stopPropagation();
    onChange([]);
  };

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentGroup = groups.find((g) => g.id === selectedId);

  return (
    <div className="space-y-1 relative" ref={dropdownRef}>
      <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
        Target Grup / Angkatan (Maksimal 1)
      </label>

      {/* Trigger Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-[42px] px-4 bg-white border rounded-xl flex items-center gap-3 cursor-pointer transition-all ${
          isOpen
            ? "border-green-500 ring-4 ring-green-500/5"
            : "border-gray-200"
        }`}>
        <Users
          className={`w-4 h-4 ${
            currentGroup ? "text-green-600" : "text-gray-400"
          }`}
        />

        <div className="flex-1 overflow-hidden">
          {currentGroup ? (
            <span className="text-xs font-bold text-gray-700 truncate">
              {currentGroup.name}
            </span>
          ) : (
            <span className="text-xs text-gray-400">
              Pilih Grup Mahasiswa...
            </span>
          )}
        </div>

        {currentGroup && (
          <X
            className="w-3.5 h-3.5 text-gray-400 hover:text-red-500 transition-colors"
            onClick={clearSelection}
          />
        )}
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-[100] w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2 border-b border-gray-50 bg-gray-50/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama grup..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-green-400 transition-all"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          <div className="max-h-52 overflow-y-auto custom-scrollbar p-1">
            {filteredGroups.length > 0 ? (
              filteredGroups.map((g) => {
                const isSelected = g.id === selectedId;
                return (
                  <div
                    key={g.id}
                    onClick={() => handleSelect(g.id)}
                    className={`flex items-center justify-between px-3 py-3 rounded-xl cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-green-50 text-green-700"
                        : "hover:bg-gray-50 text-gray-600"
                    }`}>
                    <div className="flex flex-col">
                      <span
                        className={`text-xs ${
                          isSelected ? "font-bold" : "font-medium"
                        }`}>
                        {g.name}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] opacity-70">
                          Grup terpilih
                        </span>
                      )}
                    </div>
                    {isSelected && <Check className="w-4 h-4" />}
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-gray-400 italic">
                Grup tidak ditemukan
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="text-[10px] text-red-500 font-bold mt-1">{error}</p>
      )}
    </div>
  );
}
