import {
  Home,
  Users,
  Package,
  ClipboardCheck,
  Database,
  Globe,
  HelpCircle,
} from "lucide-react";

export const SideBarItems = [
  { name: "Beranda", icon: Home, route: "admin.dashboard" },
  {
    name: "Pengguna",
    icon: Users,
    route: "admin.users.index",
    subMenus: [
      {
        name: "Kelola Pengguna",
        id: "Management",
        route: "admin.users.index",
        params: { section: "management" },
      },
      {
        name: "Grup Pengguna",
        id: "Groups",
        route: "admin.users.index",
        params: { section: "groups" },
      },
      {
        name: "Pilih Pengguna",
        id: "Selection",
        route: "admin.users.index",
        params: { section: "selection" },
      },
      {
        name: "Pengguna Online",
        id: "Online",
        route: "admin.users.index",
        params: { section: "online" },
      },
      {
        name: "Import",
        id: "Import",
        route: "admin.users.index",
        params: { section: "import" },
      },
      {
        name: "Results",
        id: "Results",
        route: "admin.users.index",
        params: { section: "results" },
      },
    ],
  },
  {
    name: "Modules",
    icon: Package,
    route: "admin.modules.index",
    subMenus: [
      { name: "Daftar Modul", id: "Class", route: "admin.modules.index" },
      { name: "Tambah Modul", id: "Create", route: "admin.modules.create" },
    ],
  },
  { name: "Tests", icon: ClipboardCheck, route: "admin.tests.index" },
  { name: "Backup", icon: Database, route: "#" },
  { name: "Public", icon: Globe, route: "#" },
  { name: "Help", icon: HelpCircle, route: "#" },
];
