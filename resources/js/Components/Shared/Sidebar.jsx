import React, { useState, useEffect } from "react";
import { Link, usePage } from "@inertiajs/react";
import { ClipboardCheck, LogOut, ChevronDown } from "lucide-react";
import { SideBarItems } from "@/constants/sideBarItems";
import { sideBarPalettes } from "@/Components/customStyles/sideBarStyles";

export default function Sidebar({
  isVisible,
  onToggle,
  theme = "luxuryNature",
}) {
  const { url } = usePage();
  const [expandedItems, setExpandedItems] = useState({});
  const currentPalette = sideBarPalettes[theme] || sideBarPalettes.luxuryNature;

  useEffect(() => {
    const activeParents = {};
    SideBarItems.forEach((item) => {
      // Logic deteksi active parent yang lebih fleksibel
      if (
        item.subMenus &&
        url.includes(item.route.replace(".index", "").replace(/\./g, "/"))
      ) {
        activeParents[item.name] = true;
      }
    });
    setExpandedItems(activeParents);
  }, [url]);

  const toggleExpand = (name) => {
    setExpandedItems((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <>
      {isVisible && (
        <div
          className="fixed inset-0 bg-black/60 z-[40] lg:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={onToggle}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-[50] w-64 transition-transform duration-300 ease-in-out flex flex-col ${
          isVisible ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{ background: currentPalette.sidebar }}>
        <div className="p-6 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: currentPalette.activeItem }}>
              <ClipboardCheck
                className="w-6 h-6"
                style={{ color: currentPalette.sidebarText }}
              />
            </div>
            <div>
              <h1
                className="text-xl font-bold leading-none"
                style={{ color: currentPalette.sidebarText }}>
                CBT-FKUnila
              </h1>
              <p
                className="text-[10px] mt-1 uppercase tracking-[0.2em]"
                style={{ color: currentPalette.sidebarText, opacity: 0.7 }}>
                Halaman Admin
              </p>
            </div>
          </div>
          <div
            className="h-[1px] w-full mt-4"
            style={{
              background: `linear-gradient(to right, ${currentPalette.activeText}50, transparent)`,
            }}
          />
        </div>

        <nav className="flex-1 overflow-y-auto px-3 space-y-1 custom-scrollbar">
          {SideBarItems.map((item) => {
            const hasRoute = (name) => {
              try {
                return name ? route().has(name) : false;
              } catch (e) {
                return false;
              }
            };

            // Deteksi Active State: Cek apakah route utama aktif
            const isActive = hasRoute(item.route)
              ? route().current(item.route + "*")
              : false;
            const isExpanded = expandedItems[item.name] || false;
            const hasSubMenus = item.subMenus && item.subMenus.length > 0;
            const Icon = item.icon;

            return (
              <React.Fragment key={item.name}>
                {hasSubMenus ? (
                  <button
                    onClick={() => toggleExpand(item.name)}
                    className="flex items-center justify-between w-full gap-3 px-4 py-3 rounded-xl transition-all"
                    style={{
                      backgroundColor: isActive
                        ? currentPalette.activeItem
                        : "transparent",
                      color: isActive
                        ? currentPalette.activeText
                        : currentPalette.sidebarText,
                    }}>
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span className="text-sm md:text-base">{item.name}</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                ) : (
                  <Link
                    href={hasRoute(item.route) ? route(item.route) : "#"}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                    style={{
                      backgroundColor: isActive
                        ? currentPalette.activeItem
                        : "transparent",
                      color: isActive
                        ? currentPalette.activeText
                        : currentPalette.sidebarText,
                    }}>
                    <Icon className="w-5 h-5" />
                    <span className="text-sm md:text-base">{item.name}</span>
                  </Link>
                )}

                {hasSubMenus && (
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      isExpanded
                        ? "max-h-[500px] opacity-100"
                        : "max-h-0 opacity-0"
                    }`}>
                    <div
                      className="ml-9 mt-1 mb-2 space-y-1 pl-4 border-l-2"
                      style={{ borderColor: `${currentPalette.activeItem}50` }}>
                      {item.subMenus.map((submenu) => {
                        const subRouteExists = hasRoute(submenu.route);
                        if (!subRouteExists) {
                          console.error(
                            `Rute ${submenu.route} tidak ditemukan oleh Ziggy!`
                          );
                        }
                        const isSubActive =
                          subRouteExists &&
                          (submenu.params
                            ? route().current(submenu.route, submenu.params)
                          : route().current(submenu.route));

                        return (
                          <Link
                            key={submenu.id}
                            href={
                              subRouteExists
                                ? route(submenu.route, submenu.params || {})
                                : "#"
                            }
                            className="block py-2 text-sm transition-colors"
                            preserveState
                            preserveScroll
                            style={{
                              color: isSubActive
                                ? currentPalette.activeText
                                : currentPalette.sidebarText + "99",
                              fontWeight: isSubActive ? "bold" : "normal",
                            }}>
                            {submenu.name}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}

          <div
            className="pt-4 pb-8 mt-4"
            style={{ borderTop: `1px solid ${currentPalette.activeItem}50` }}>
            <Link
              href={route("logout")}
              method="post"
              as="button"
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500 transition-all w-full text-left group"
              style={{ color: currentPalette.sidebarText + "99" }}>
              <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              <span className="text-sm md:text-base">Exit System</span>
            </Link>
          </div>
        </nav>
      </aside>
    </>
  );
}
