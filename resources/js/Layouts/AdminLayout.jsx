import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import Sidebar from "@/Components/Shared/Sidebar";
import Navbar from "@/Components/Shared/Navbar";
import FlashMessage from "@/Components/Shared/FlashMessage";

export default function AdminLayout({ children, title }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Head title={title} />
    
      {/* Sidebar Component */}
      <Sidebar isVisible={isSidebarOpen} onToggle={toggleSidebar} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar pageTitle={title} onMenuClick={toggleSidebar} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 md:p-8">
          <FlashMessage />
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>

        <footer className="bg-white py-4 text-center text-xs text-blue-600 border-t">
          CBT Ilmu Komputer - Fakultas Kedokteran
        </footer>
      </div>
    </div>
  );
}     
