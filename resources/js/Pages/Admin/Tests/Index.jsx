import React, { useMemo } from "react";
import { Head, usePage } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import Management from "./Components/TestManagement";

export default function Index(props) {
  const { url } = usePage();

  // Membaca section dari URL dengan lebih stabil
  const section = useMemo(() => {
    const urlObj = new URL(url, window.location.origin);
    return urlObj.searchParams.get("section") || "tests";
  }, [url]);

  const renderContent = () => {
    switch (section) {
      case "tests":
        return <Management {...props} />;
      default:
        return (
          <div className="bg-white p-20 rounded-xl border border-dashed text-center text-gray-400">
            <span className="material-icons text-5xl mb-4">construction</span>
            <p className="font-bold uppercase tracking-widest italic">
              Modul {section.replace("_", " ")} Sedang Dikembangkan
            </p>
          </div>
        );
    }
  };

  return (
    <AdminLayout>
      <Head title={`Tests - ${section.toUpperCase()}`} />

      <div key={section} className="animate-in fade-in zoom-in-95 duration-300">
        {renderContent()}
      </div>
    </AdminLayout>
  );
}
