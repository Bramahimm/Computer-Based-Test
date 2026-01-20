import React from "react";
import Input from "@/Components/UI/Input";

export default function ScoringTab({ data, setData }) {
  return (
    <div className="space-y-4 text-left">
      <h4 className="text-[11px] font-bold text-gray-400">
        Penilaian (UI Only)
      </h4>
      <Input
        label="Point Minimal Lulus"
        type="number"
        value={data.points_to_pass}
        onChange={(e) => setData("points_to_pass", e.target.value)}
      />
      <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
        <p className="text-[9px] text-amber-600 font-bold leading-tight italic">
          Field penilaian tambahan (Point Salah/Kosong) akan disinkronkan pada
          sprint berikutnya.
        </p>
      </div>
    </div>
  );
}
