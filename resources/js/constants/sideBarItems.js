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
        name: "Import Pengguna",
        id: "Import",
        route: "admin.users.index",
        params: { section: "import" },
      },
      {
        name: "Hasil Individu",
        id: "Individual",
        route: "admin.users.index",
        params: { section: "individual" },
      },
    ],
  },

  {
    name: "Modules",
    icon: Package,
    route: "admin.modules.index",
    subMenus: [
      {
        name: "Grup Angkatan",
        route: "admin.modules.index",
        params: { section: "class" },
      },
      {
        name: "Mata Kuliah",
        route: "admin.modules.index",
        params: { section: "subjects" },
      },
      {
        name: "Pertanyaan",
        route: "admin.modules.index",
        params: { section: "questions" },
      },
      {
        name: "Jawaban",
        route: "admin.modules.index",
        params: { section: "results" },
      },
      {
        name: "Import Soal",
        route: "admin.modules.index",
        params: { section: "import" },
      },

    ],
  },

  {
    name: "Tests",
    icon: ClipboardCheck,
    route: "admin.tests.index",
    subMenus: [
      {
        name: "Tests",
        route: "admin.tests.index",
        params: { section: "tests" },
      },
      {
        name: "results",
        route: "admin.modules.index",
        params: { section: "hasil" },
      },
      {
        name: "Users",
        route: "admin.modules.index",
        params: { section: "questions" },
      },
      {
        name: "Statistics",
        route: "admin.modules.index",
        params: { section: "results" },
      },
    ],
  },
  { name: "Backup", icon: Database, route: "#" },
  { name: "Public", icon: Globe, route: "#" },
  { name: "Help", icon: HelpCircle, route: "#" },
];