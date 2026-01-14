import React, { useState } from "react";
import Button from "@/Components/UI/Button";

export default function Import() {
  const [previewData, setPreviewData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const simulateFileSelect = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setPreviewData([
        {
          row: 1,
          type: "Question",
          label: "Mitochondria function...",
          status: "valid",
        },
        {
          row: 2,
          type: "Question",
          label: "Anatomy of liver...",
          status: "error",
          message: "Missing correct answer",
        },
        {
          row: 3,
          type: "Subject",
          label: "Clinical Pathology",
          status: "valid",
        },
      ]);
      setIsProcessing(false);
    }, 1200);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-10 border-b bg-green-50/30 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <span className="material-icons text-green-500 text-4xl">
              upload_file
            </span>
          </div>

          <h2 className="text-xl font-bold text-gray-800">
            Impor Soal!
          </h2>

          <p className="text-sm text-gray-500">
            Supports structured .csv or .xml files based on TCExam standards.
          </p>

          <Button
            onClick={simulateFileSelect}
            disabled={isProcessing}
            className="bg-green-600 px-10"
          >
            {isProcessing ? "Reading file..." : "Select File"}
          </Button>
        </div>
      </div>

      {previewData && (
        <div className="p-8 animate-in fade-in slide-in-from-bottom-4">
          <h3 className="text-sm font-black text-gray-400 uppercase mb-4 tracking-widest">
            Pre-Import Validation Preview
          </h3>

          <div className="overflow-x-auto border border-gray-100 rounded-lg">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-tighter">
                <tr>
                  <th className="p-3">Row</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Data Preview</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Validation Note</th>
                </tr>
              </thead>
              <tbody>
                {previewData.map((row, i) => (
                  <tr
                    key={i}
                    className={`border-t ${
                      row.status === "error"
                        ? "bg-red-50/50 text-red-700"
                        : "text-gray-600"
                    }`}
                  >
                    <td className="p-3 font-bold">{row.row}</td>
                    <td className="p-3">{row.type}</td>
                    <td className="p-3">{row.label}</td>
                    <td className="p-3 italic uppercase font-black">
                      {row.status}
                    </td>
                    <td className="p-3 text-[10px]">
                      {row.message || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setPreviewData(null)}>
              Clear
            </Button>
            <Button className="bg-blue-600 px-12">
              Commit Import
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
