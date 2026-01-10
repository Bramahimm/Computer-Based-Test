import React, { useState } from "react";
import { Head } from "@inertiajs/react";

import SidebarPreview from "./Components/SidebarPreview";
import Navbar from "@/Components/Shared/Navbar";
import FlashMessage from "@/Components/Shared/FlashMessage";

/* ================= DASHBOARD ================= */
import Dashboard from "./Dashboard";

/* ================= USERS MODULE ================= */
import UserManagement from "./Users/Management";
import Selection from "./Users/Selection";
import Grouping from "./Users/Grouping";
import Online from "./Users/Online";
import ImportUsers from "./Users/Import";
import UserResults from "./Users/Results";

/* ================= MODULES ================= */
import ClassPage from "./Modules/Class";
import Subjects from "./Modules/Subjects";
import Questions from "./Modules/Questions";
import ModulesImport from "./Modules/Import";
import ModuleResults from "./Modules/Results";
import ModuleResultDetail from "./Modules/Results/Detail";

export default function Preview() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // 🔑 DEFAULT PAGE = DASHBOARD
  const [activePageId, setActivePageId] = useState("Dashboard");

  /* ========== MOCK DATA ========== */
  const mockGroups = [
    { id: 1, name: "Medical Student 2022" },
    { id: 2, name: "Medical Student 2023" },
  ];

  const mockUsers = [];
  const mockResults = [];

  /* ========== MOCK ROUTER ========== */
  const renderContent = () => {
    switch (activePageId) {
      /* ===== DASHBOARD ===== */
      case "Dashboard":
        return <Dashboard />;

      /* ===== USERS ===== */
      case "Management":
        return <UserManagement groupList={mockGroups} />;

      case "Groups":
        return <Grouping existingGroups={mockGroups} />;

      case "Selection":
        return <Selection userList={mockUsers} />;

      case "Online":
        return <Online onlineUsers={mockUsers} />;

      case "Import":
        return <ImportUsers />;

      case "Results":
        return <UserResults resultData={mockResults} />;

      /* ===== MODULES ===== */
      case "Modules_Class":
        return <ClassPage />;

      case "Modules_Subjects":
        return <Subjects />;

      case "Modules_Questions":
        return <Questions />;

      case "Modules_Import":
        return <ModulesImport />;

      case "Modules_Results":
        return <ModuleResults />;

      case "Modules_Results_Detail":
        return <ModuleResultDetail />;

      /* ===== FALLBACK ===== */
      default:
        return (
          <div className="bg-white border rounded-xl p-10 text-center shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Preview Page Not Mapped
            </h2>
            <p className="text-gray-500 text-sm">
              Halaman{" "}
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                {activePageId}
              </span>{" "}
              belum diregistrasikan
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Head title={`CBT Preview - ${activePageId}`} />

      <SidebarPreview
        isVisible={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onNavigate={(id) => setActivePageId(id)}
        activePageId={activePageId}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          pageTitle={`CBT / Admin / ${activePageId}`}
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 md:p-8">
          {/* INFO PREVIEW */}
          <div className="bg-yellow-100 text-yellow-800 p-2 mb-4 text-xs font-bold rounded text-center">
            PREVIEW MODE — Semua halaman berjalan statis (Mock Router)
          </div>

          <FlashMessage />

          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
