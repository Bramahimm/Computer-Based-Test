import React, { useMemo } from "react";
import { Head, usePage } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";

/**
 * Sub pages
 */
import ClassPage from "./Class";
import Questions from "./Questions";
import Subjects from "./Subjects";
import Results from "./Results";
import ImportPage from "./Import";

export default function Index({ modules }) {
  const { url } = usePage();

  const section = useMemo(() => {
    const params = new URLSearchParams(url.split("?")[1]);
    return params.get("section") || "class";
  }, [url]);

  const renderSection = () => {
    switch (section) {
      case "class":
        return <ClassPage modules={modules} />;

      case "questions":
        return <Questions />;

      case "subjects":
        return <Subjects />;

      case "results":
        return <Results />;

      case "import":
        return <ImportPage />;

      default:
        return <ClassPage modules={modules} />;
    }
  };

  return (
    <AdminLayout title={`Modules - ${section}`}>
      <Head title="Modules" />

      <div className="space-y-6">
        <div key={section} className="animate-in fade-in duration-300">
          {renderSection()}
        </div>
      </div>
    </AdminLayout>
  );
}
