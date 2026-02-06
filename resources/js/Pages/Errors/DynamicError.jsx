import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { 
    AlertTriangle, 
    ArrowLeft, 
    ShieldAlert, 
    Search, 
    ServerCrash, 
    Construction 
} from 'lucide-react';

export default function DynamicError({ status, message }) {
    // Judul Utama berdasarkan Status Code
    const title = {
        503: '503: Service Unavailable',
        500: '500: Server Error',
        404: '404: Page Not Found',
        403: 'Akses Dibatasi',
        419: 'Sesi Berakhir',
    }[status] || `Error ${status}`;

    // Deskripsi: Utamakan pesan kustom dari Middleware, jika tidak ada pakai default
    const description = message || {
        503: 'Maaf, server kami sedang dalam pemeliharaan rutin. Silakan coba beberapa saat lagi.',
        500: 'Terjadi kesalahan internal pada server kami. Tim IT sedang menanganinya.',
        404: 'Halaman yang Anda cari tidak dapat ditemukan atau telah dipindahkan.',
        403: 'Maaf, Anda tidak memiliki akses untuk membuka halaman ini.',
        419: 'Halaman telah kadaluarsa karena sesi Anda berakhir. Silakan muat ulang.',
    }[status];

    // Icon yang sesuai
    const Icon = {
        503: Construction,
        500: ServerCrash,
        404: Search,
        403: ShieldAlert,
        419: AlertTriangle,
    }[status] || AlertTriangle;

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
            <Head title={title} />
            
            <div className="max-w-md w-full text-center">
                <div className="mb-8 flex justify-center">
                    <div className="p-6 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
                        <Icon className="w-20 h-20 text-emerald-600" />
                    </div>
                </div>

                <h1 className="text-3xl font-black text-slate-800 mb-4 tracking-tight uppercase">
                    {title}
                </h1>
                
                {/* Menampilkan Pesan Spesifik dari Middleware */}
                <p className="text-lg text-slate-600 mb-10 leading-relaxed font-medium bg-white/50 p-4 rounded-2xl border border-dashed border-slate-200">
                    {description}
                </p>

                <div className="flex flex-col gap-3">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 active:scale-95"
                    >
                        <ArrowLeft className="w-5 h-5" /> Kembali ke Beranda
                    </Link>
                    
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-6 py-4 text-slate-400 font-semibold hover:text-slate-600 transition-colors text-sm"
                    >
                        Muat Ulang Halaman
                    </button>
                </div>

                <div className="mt-12">
                    <p className="text-[10px] text-slate-300 uppercase tracking-widest font-bold">
                        TEAM IT FK UNILA &copy; {new Date().getFullYear()}
                    </p>
                </div>
            </div>
        </div>
    );
}