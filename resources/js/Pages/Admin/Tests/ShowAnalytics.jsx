import React, { useState, useEffect } from "react";
import { Head, router, Link } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import {
  Clock, CheckCircle, XCircle, Plus, StopCircle, ArrowLeft, RefreshCw, Lock
} from "lucide-react";

// 🔥 1. TERIMA PROP BARU: serverRemainingSeconds
export default function ShowAnalytics({ testUser, serverRemainingSeconds }) {
  const [addTimeInput, setAddTimeInput] = useState("");
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  
  // 🔥 2. STATE UNTUK TIMER (Inisialisasi dari Server)
  const [timeLeft, setTimeLeft] = useState(serverRemainingSeconds || 0);

  // Sync state saat auto-refresh terjadi (agar timer akurat dengan server)
  useEffect(() => {
      setTimeLeft(serverRemainingSeconds || 0);
  }, [serverRemainingSeconds]);

  // 🔥 3. LOGIKA COUNTDOWN PINTAR (Berhenti jika Locked)
  useEffect(() => {
    // Jika selesai atau stop auto refresh, jangan jalankan timer
    if (testUser?.status !== 'ongoing' || !isAutoRefresh) return;

    const timer = setInterval(() => {
        // JIKA SEDANG DI-LOCK, JANGAN KURANGI WAKTU! (VISUAL FREEZE)
        if (testUser.is_locked) {
            return; 
        }
        
        setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [testUser?.status, testUser?.is_locked, isAutoRefresh]);

  // Auto Refresh Logic (5 Detik)
  useEffect(() => {
    let interval;
    if (isAutoRefresh && testUser?.status === 'ongoing') {
      interval = setInterval(() => {
        router.reload({
          only: ['testUser', 'serverRemainingSeconds'], // Refresh sisa waktu juga
          preserveScroll: true,
          preserveState: true,
        });
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isAutoRefresh, testUser?.status]);

  if (!testUser) return (
    <AdminLayout>
        <div className="p-10 text-center text-gray-500">Data peserta tidak ditemukan.</div>
    </AdminLayout>
  );

  // Statistik Data (Sama seperti sebelumnya)
  const userAnswers = testUser.answers || [];
  const totalQuestions = testUser.test?.questions?.length || 0;
  const answeredCount = userAnswers.filter(a => a.answer_id).length;
  const correctCount = userAnswers.filter(a => a.is_correct).length;
  const wrongCount = userAnswers.filter(a => !a.is_correct && a.answer_id).length;
  const unansweredCount = totalQuestions - answeredCount;

  // 🔥 4. FORMATTER WAKTU (Detik -> Menit:Detik)
  const formatTime = (seconds) => {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;
      if (h > 0) return `${h}j ${m}m ${s}d`;
      return `${m}m ${s}d`;
  };

  // Handler functions (Tetap sama)
  const handleAddTime = () => {
    if (!addTimeInput) return;
    if (confirm(`Tambah waktu ${addTimeInput} menit?`)) {
      router.post(route('admin.analytics.forceSubmit', testUser.id), { extend_minutes: addTimeInput }, {
        onSuccess: () => { setAddTimeInput(""); alert("Berhasil!"); }
      });
    }
  };

  const handleForceStop = () => {
    if (confirm("Stop paksa ujian ini?")) {
      router.post(route('admin.analytics.forceSubmit', testUser.id));
    }
  };

  return (
    <AdminLayout>
      <Head title={`Detail: ${testUser.user?.name}`} />
      
      <div className="space-y-6 pb-20">
        
        {/* Navigasi Atas */}
        <div className="flex justify-between items-center mb-2">
            <Link 
                href={route('admin.tests.index', { section: 'analitics', test_id: testUser.test_id })}
                className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold transition bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200"
            >
                <ArrowLeft className="w-5 h-5" /> Kembali ke Daftar
            </Link>

            <button 
                onClick={() => setIsAutoRefresh(!isAutoRefresh)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition border ${
                    isAutoRefresh 
                    ? 'bg-green-100 text-green-700 border-green-200 animate-pulse' 
                    : 'bg-gray-100 text-gray-500 border-gray-200'
                }`}
            >
                <RefreshCw className={`w-3 h-3 ${isAutoRefresh ? 'animate-spin' : ''}`} />
                {isAutoRefresh ? 'LIVE MONITORING' : 'PAUSED'}
            </button>
        </div>

        {/* 1. Header Info Peserta */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold shadow-blue-200 shadow-lg">
                    {testUser.user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        {testUser.user?.name}
                        {testUser.is_locked && (
                            <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full flex items-center gap-1 border border-red-200">
                                <Lock className="w-3 h-3" /> TERKUNCI
                            </span>
                        )}
                    </h1>
                    <p className="text-gray-500 font-medium">{testUser.user?.email}</p>
                    <div className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                        <Clock className="w-3 h-3" /> Mulai: {new Date(testUser.started_at).toLocaleString('id-ID')}
                    </div>
                </div>
            </div>

            {/* 🔥 TAMPILAN TIMER BARU */}
            <div className={`px-8 py-4 rounded-xl text-3xl font-mono font-bold border-2 flex flex-col items-center min-w-[200px] ${
                testUser.is_locked 
                ? 'bg-gray-100 text-gray-500 border-gray-300' // Tampilan Abu jika Locked
                : timeLeft <= 300 
                    ? 'bg-red-50 text-red-600 border-red-100' 
                    : 'bg-green-50 text-green-600 border-green-100'
            }`}>
                <span>{testUser.is_locked ? "PAUSED" : formatTime(timeLeft)}</span>
                <span className="text-xs font-sans font-bold uppercase tracking-wider opacity-60">Sisa Waktu</span>
            </div>
        </div>

        {/* ... (SISANYA SAMA: Statistik, Panel Kontrol, Detail Jawaban) ... */}
        {/* Copas sisa kode return dari komponen lama Anda di bawah ini */}
        
        {/* 2. Statistik Progress */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center justify-center">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Progress</p>
                <p className="text-3xl font-bold text-blue-600 flex items-baseline gap-1">
                    {answeredCount}<span className="text-lg text-gray-300 font-medium">/{totalQuestions}</span>
                </p>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center justify-center">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Benar</p>
                <p className="text-3xl font-bold text-green-500">{correctCount}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center justify-center">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Salah</p>
                <p className="text-3xl font-bold text-red-500">{wrongCount}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center justify-center">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Kosong</p>
                <p className="text-3xl font-bold text-yellow-500">{unansweredCount}</p>
            </div>
        </div>

        {/* 3. Panel Kontrol */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-blue-500" /> Tambah Waktu Darurat
                </h3>
                <div className="flex gap-2">
                    <input 
                        type="number" 
                        value={addTimeInput}
                        onChange={(e) => setAddTimeInput(e.target.value)}
                        placeholder="Menit..." 
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                    />
                    <button 
                        onClick={handleAddTime}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                    >
                        Simpan
                    </button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between">
                <div>
                    <h3 className="font-bold text-red-600 mb-1 flex items-center gap-2">
                        <StopCircle className="w-5 h-5" /> Hentikan Ujian Paksa
                    </h3>
                    <p className="text-xs text-gray-400">Status peserta akan diubah menjadi 'Selesai'.</p>
                </div>
                <button 
                    onClick={handleForceStop}
                    className="mt-3 w-full bg-red-50 text-red-600 border border-red-100 px-6 py-2.5 rounded-lg font-bold hover:bg-red-600 hover:text-white transition"
                >
                    STOP SEKARANG
                </button>
            </div>
        </div>

        {/* 4. Detail Jawaban & Pilihan Ganda */}
        <div className="space-y-4">
            <h3 className="font-bold text-lg text-gray-800 border-l-4 border-blue-500 pl-3">
                Rincian Jawaban ({answeredCount}/{totalQuestions})
            </h3>
            
            <div className="grid gap-6">
                {testUser.test?.questions?.map((q, idx) => {
                    const ans = userAnswers.find(a => a.question_id === q.id);
                    const isCorrect = ans?.is_correct;
                    const studentAnswerId = ans?.answer_id;

                    return (
                        <div key={q.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition">
                            {/* Header Soal */}
                            <div className="flex gap-4 mb-4">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm ${
                                    isCorrect ? 'bg-green-500' : studentAnswerId ? 'bg-red-500' : 'bg-gray-300'
                                }`}>
                                    {idx + 1}
                                </div>
                                <div className="flex-1">
                                    <div 
                                        className="text-gray-800 font-medium text-sm mb-2 prose max-w-none" 
                                        dangerouslySetInnerHTML={{ __html: q.question_text }} 
                                    />
                                    
                                    {!studentAnswerId && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500 border border-gray-200">
                                            Tidak Dijawab
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Daftar Pilihan Ganda */}
                            <div className="space-y-2 ml-12">
                                {q.answers?.map((option, optIdx) => {
                                    const isSelected = studentAnswerId === option.id;
                                    const isKey = option.is_correct === 1;

                                    let optionClass = "border-gray-200 bg-white text-gray-600";
                                    let icon = null;

                                    if (isSelected && isKey) {
                                        optionClass = "border-green-500 bg-green-50 text-green-700 font-bold ring-1 ring-green-500";
                                        icon = <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />;
                                    } else if (isSelected && !isKey) {
                                        optionClass = "border-red-500 bg-red-50 text-red-700 font-bold ring-1 ring-red-500";
                                        icon = <XCircle className="w-4 h-4 text-red-600 ml-auto" />;
                                    } else if (isKey) {
                                        optionClass = "border-blue-300 bg-blue-50 text-blue-700 font-semibold"; 
                                        icon = <span className="text-[10px] bg-blue-200 px-2 py-0.5 rounded text-blue-800 ml-auto">Kunci</span>;
                                    }

                                    return (
                                        <div 
                                            key={option.id} 
                                            className={`flex items-center p-3 rounded-lg border text-sm transition ${optionClass}`}
                                        >
                                            <span className="w-6 h-6 rounded-full bg-white border border-gray-300 flex items-center justify-center text-xs font-bold mr-3 shrink-0 text-gray-500">
                                                {String.fromCharCode(65 + optIdx)}
                                            </span>
                                            <span className="flex-1" dangerouslySetInnerHTML={{ __html: option.answer_text }}></span>
                                            {icon}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

      </div>
    </AdminLayout>
  );
}