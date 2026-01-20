import React from "react";

export default function AdvancedSettings() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-left space-y-4">
      <div className="flex items-center gap-3 text-amber-600">
        <span className="material-icons">construction</span>
        <h4 className="text-xs font-black uppercase tracking-widest">
          Advanced Settings (UI Integration Only)
        </h4>
      </div>
      <p className="text-[10px] text-amber-700 italic font-medium">
        Pengaturan di bawah ini belum terikat ke API dan hanya digunakan sebagai
        kerangka UI masa depan.
      </p>

      <div className="grid grid-cols-2 gap-6 opacity-40 select-none grayscale">
        <div className="space-y-1">
          <label className="text-[9px] font-black text-gray-500 uppercase">
            No Answer Policy
          </label>
          <div className="h-8 bg-white border border-gray-200 rounded-lg"></div>
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-black text-gray-500 uppercase">
            Randomization
          </label>
          <div className="h-8 bg-white border border-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}
