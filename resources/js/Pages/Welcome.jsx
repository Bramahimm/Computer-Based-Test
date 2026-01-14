import { Head, Link } from "@inertiajs/react";
import { useState } from "react";

// --- 1. DEFINISI PALET WARNA ---
const PALETTES = {
    luxuryNature: {
        id: "luxuryNature",
        name: "Royal Emerald",
        bg: "#F8FAFC",
        sidebar: "linear-gradient(180deg, #047857 0%, #022C22 100%)",
        sidebarText: "#A7F3D0",
        activeItem: "rgba(255, 255, 255, 0.1)",
        activeText: "#FFFFFF",
        activeBorder: "#34D399",
        card: "#FFFFFF",
        text: "#111827",
        subText: "#64748B",
        primary: "#059669",
        border: "#E2E8F0",
        success: "#059669",
    },
    darkGreen: {
        id: "darkGreen",
        name: "Dark Matrix",
        bg: "#0B1120",
        sidebar: "#020617",
        sidebarText: "#94A3B8",
        activeItem: "#064E3B",
        activeText: "#34D399",
        activeBorder: "#34D399",
        card: "#1E293B",
        text: "#E2E8F0",
        subText: "#94A3B8",
        primary: "#10B981",
        border: "#1E293B",
        success: "#34D399",
    },
};

// --- KOMPONEN ICON (FIXED JSX ERROR) ---
const Icon = ({ name, size = 24, color }) => {
    const icons = {
        // Login: 3 elemen, wajib dibungkus fragment
        login: (
            <>
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
            </>
        ),
        shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
        check: <polyline points="20 6 9 17 4 12" />,
        // ArrowRight: 2 elemen, wajib dibungkus fragment
        arrowRight: (
            <>
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
            </>
        )
    };
    
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width={size} height={size} viewBox="0 0 24 24" 
            fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
            {icons[name] || icons.arrowRight}
        </svg>
    );
};

export default function WelcomePage() {
    const [theme, setTheme] = useState("luxuryNature");
    const c = PALETTES[theme];

    return (
        <>
            <Head title="Welcome - CBT FK" />

            <div 
                className="min-h-screen flex flex-col lg:flex-row transition-colors duration-500 font-sans selection:bg-green-500 selection:text-white"
                style={{ backgroundColor: c.bg }}
            >
                {/* --- KOLOM KIRI: KONTEN & LOGIN --- */}
                <div className="flex-1 flex flex-col justify-center p-8 lg:p-16 xl:p-24 relative z-10">
                    
                    {/* Header Logo */}
                    <div className="absolute top-8 left-8 lg:top-12 lg:left-16 flex items-center gap-3">
                        <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg"
                            style={{ background: theme === 'luxuryNature' ? c.sidebar : c.primary }}
                        >
                            <Icon name="shield" size={20} color="#FFF" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-widest uppercase" style={{ color: c.text }}>
                                CBT <span style={{ color: c.primary }}>FK-MED</span>
                            </h1>
                        </div>
                    </div>

                    {/* Main Hero Content */}
                    <div className="max-w-xl mt-16 lg:mt-0">
                        <span 
                            className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6 border"
                            style={{ 
                                backgroundColor: theme === 'darkGreen' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(5, 150, 105, 0.1)',
                                color: c.primary,
                                borderColor: theme === 'darkGreen' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(5, 150, 105, 0.2)'
                            }}
                        >
                            Medical Assessment System
                        </span>
                        
                        <h2 className="text-4xl lg:text-6xl font-extrabold leading-tight mb-6" style={{ color: c.text }}>
                            Excellence in <br/>
                            <span style={{ color: c.primary }}>Medical Evaluation</span>
                        </h2>
                        
                        <p className="text-lg mb-10 leading-relaxed" style={{ color: c.subText }}>
                            Platform Computer Based Test (CBT) Fakultas Kedokteran. 
                            Terintegrasi, aman, dan dirancang untuk standar ujian medis profesional.
                        </p>

                        {/* Login Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button 
                                className="group flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                                style={{ 
                                    backgroundColor: c.primary, 
                                    color: theme === 'darkGreen' ? '#000' : '#FFF',
                                    boxShadow: `0 10px 20px -10px ${c.primary}`
                                }}
                            >
                                <Icon name="login" size={20} />
                                LOGIN MAHASISWA
                            </button>
                            
                            <button 
                                className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-sm tracking-wide border transition-all duration-300 hover:bg-gray-50/5"
                                style={{ 
                                    borderColor: c.border, 
                                    color: c.text 
                                }}
                            >
                                Login Dosen / Admin
                            </button>
                        </div>

                        {/* Feature List */}
                        <div className="mt-12 flex items-center gap-6 text-sm font-medium" style={{ color: c.subText }}>
                            <div className="flex items-center gap-2">
                                <div className="p-1 rounded-full bg-green-100 text-green-700">
                                    <Icon name="check" size={14} />
                                </div>
                                Secure Exam
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="p-1 rounded-full bg-green-100 text-green-700">
                                    <Icon name="check" size={14} />
                                </div>
                                Real-time Result
                            </div>
                        </div>
                    </div>

                    {/* Footer Copyright */}
                    <div className="absolute bottom-6 left-8 lg:left-16 text-xs opacity-60" style={{ color: c.subText }}>
                        © 2025 Fakultas Kedokteran. All rights reserved.
                    </div>
                </div>

                {/* --- KOLOM KANAN: VISUAL AREA (The Luxury Gradient) --- */}
                <div 
                    className="relative hidden lg:flex lg:w-1/2 overflow-hidden items-center justify-center"
                    style={{ 
                        // KUNCI: Menggunakan background gradient dari sidebar palette Anda
                        background: c.sidebar 
                    }}
                >
                    {/* Decorative Patterns (Abstract Circles) */}
                    <div className="absolute top-[-20%] right-[-20%] w-[800px] h-[800px] rounded-full opacity-10 border border-white"></div>
                    <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] rounded-full opacity-10 border border-white"></div>
                    
                    {/* Glassmorphism Card (Floating Stats) */}
                    <div 
                        className="relative z-10 p-8 rounded-3xl backdrop-blur-md border border-white/10 shadow-2xl max-w-sm w-full mx-8 transform transition-transform hover:scale-105 duration-500"
                        style={{ 
                            background: "rgba(255, 255, 255, 0.05)",
                        }}
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="text-emerald-200 text-xs font-bold uppercase tracking-wider mb-1">Status Sistem</p>
                                <h3 className="text-white text-2xl font-bold">Ujian Aktif</h3>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300 animate-pulse">
                                <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                            </div>
                        </div>

                        {/* List Ujian Mini */}
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="p-3 rounded-xl bg-black/20 border border-white/5 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-900/50 flex items-center justify-center text-emerald-400 font-bold text-xs">
                                        B{i}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white text-xs font-medium">Blok Kedokteran {i}.0</p>
                                        <p className="text-white/40 text-[10px]">08:00 - 10:00 WIB</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
                            <span className="text-white/60 text-xs">Total Peserta Online</span>
                            <span className="text-white font-bold text-lg">452</span>
                        </div>
                    </div>

                    {/* Gradient Overlay for texture */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
                </div>

                {/* --- THEME SWITCHER (Floating Top Right) --- */}
                <div className="absolute top-8 right-8 z-50">
                    <div className="flex bg-white/10 backdrop-blur-md p-1 rounded-full border border-white/20 shadow-lg">
                        {Object.values(PALETTES).map((p) => (
                            <button
                                key={p.id}
                                onClick={() => setTheme(p.id)}
                                title={p.name}
                                className={`w-6 h-6 rounded-full mx-1 border transition-all duration-300 ${theme === p.id ? 'scale-125 ring-2 ring-white' : 'opacity-60 hover:opacity-100'}`}
                                style={{ 
                                    background: p.sidebar.includes('gradient') ? p.sidebar : p.primary, 
                                    borderColor: 'transparent' 
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
