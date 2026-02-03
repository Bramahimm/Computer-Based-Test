import React, { useState, useEffect, useRef } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import axios from 'axios'; 
import { Menu, Clock, BookOpen, Calendar, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2'; 

// Import Komponen Anak
import QuestionCard from "./Components/QuestionCard";
import Navigation from "./Components/Navigation";
import SubmitModal from "./Components/SubmitModal";

export default function Start({ test, testUserId, questions, remainingSeconds, existingAnswers, lastIndex, currentUser }) {
    
    const { auth } = usePage().props;

    // --- STATE ---
    const [currentIndex, setCurrentIndex] = useState(lastIndex || 0);
    const [answers, setAnswers] = useState(existingAnswers || {});
    const [timeLeft, setTimeLeft] = useState(remainingSeconds);
    
    // Ref untuk menyimpan waktu agar bisa dibaca di dalam interval tanpa reset
    const timeLeftRef = useRef(timeLeft);

    // UI State
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    const currentQuestion = questions[currentIndex];

    // --- HELPERS ---
    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const answeredCount = questions.filter(q => {
        const userAnswer = answers[q.id];
        return userAnswer && (userAnswer.answerId !== null || (userAnswer.answerText && userAnswer.answerText.trim() !== ""));
    }).length;

    // --- EFFECTS ---

    // 1. Sync Ref dengan State (PENTING)
    useEffect(() => {
        timeLeftRef.current = timeLeft;
    }, [timeLeft]);

    // 2. Jam Dinding Header
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // 3. LOGIC UTAMA: TIMER MUNDUR & POLLING STATUS (DIGABUNG DI SINI)
    useEffect(() => {
        // A. Timer Mundur (Jalan Tiap Detik)
        const countdown = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(countdown);
                    handleAutoSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // B. Fungsi Cek Status ke Server
        const checkServerStatus = async () => {
            try {
                // Anti-Cache
                const url = route('peserta.tests.check-status', testUserId) + '?_t=' + new Date().getTime();
                const response = await axios.get(url);
                const data = response.data;

                // 1. CEK STATUS (Locked / Submitted / Force Stop)
                if (data.force_stop || data.status !== 'ongoing') {
                    // Tentukan pesan berdasarkan status
                    let title = 'Ujian Berakhir';
                    let text = 'Sesi ujian Anda telah berakhir.';
                    let icon = 'warning';

                    if (data.status === 'locked') {
                        title = 'Ujian Dikunci!';
                        text = data.message || 'Anda dikunci sementara oleh pengawas.';
                        icon = 'error';
                    } else if (data.status === 'submitted') {
                        title = 'Ujian Selesai';
                        text = 'Pengawas telah menghentikan ujian.';
                    }

                    Swal.fire({
                        icon: icon,
                        title: title,
                        text: text,
                        allowOutsideClick: false,
                        confirmButtonText: 'Kembali ke Dashboard',
                        confirmButtonColor: '#d33'
                    }).then(() => {
                        window.location.href = route('peserta.dashboard');
                    });
                    return; // Stop logic di sini
                }

                // 2. CEK SINKRONISASI WAKTU
                const localTime = timeLeftRef.current;
                const serverTime = data.remaining_seconds;
                const diff = serverTime - localTime;

                // Jika selisih > 5 detik (Server lebih cepat/lambat)
                if (Math.abs(diff) > 5) {
                    console.log(`Sync Waktu: Lokal ${localTime} vs Server ${serverTime}`);
                    
                    // Alert jika waktu BERTAMBAH signifikan (> 30 detik)
                    if (diff > 30) {
                         const addedMinutes = Math.floor(diff / 60);
                         Swal.fire({
                            icon: 'success',
                            title: 'Waktu Ditambahkan!',
                            text: `Pengawas menambahkan waktu ${addedMinutes} menit.`,
                            timer: 4000,
                            toast: true,
                            position: 'top-end',
                            showConfirmButton: false,
                            background: '#ecfdf5',
                            color: '#065f46'
                         });
                    }
                    
                    // Update Timer Lokal
                    setTimeLeft(serverTime);
                }

            } catch (error) {
                console.error("Gagal polling server:", error);
                // Jika error 401/403 (Sesi habis), reload halaman
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    window.location.reload();
                }
            }
        };

        // C. Jalankan Polling (Jalan Tiap 5 Detik)
        const poller = setInterval(checkServerStatus, 5000);

        // Cleanup saat component unmount
        return () => {
            clearInterval(countdown);
            clearInterval(poller);
        };
    }, []); // Dependency array kosong aman karena kita pakai functional update & Ref

    // --- NAVIGASI & SUBMIT ---
    
    // Disable Klik Kanan
    useEffect(() => {
        const handleContext = (e) => e.preventDefault();
        document.addEventListener('contextmenu', handleContext);
        return () => document.removeEventListener('contextmenu', handleContext);
    }, []);

    const changeQuestion = (newIndex) => {
        if (newIndex < 0 || newIndex >= questions.length) return;
        setCurrentIndex(newIndex);
        setIsSidebarOpen(false);
        axios.post(route('peserta.tests.update_progress', testUserId), {
            index: newIndex,
            question_id: questions[newIndex].id
        }).catch(() => {});
    };

    const submitTest = () => {
        router.post(route('peserta.tests.submit', testUserId), {}, { replace: true });
    };

    const handleAutoSubmit = () => {
        Swal.fire({
            title: 'Waktu Habis!',
            text: 'Jawaban dikirim otomatis.',
            icon: 'info',
            timer: 2000,
            showConfirmButton: false,
            allowOutsideClick: false
        }).then(() => submitTest());
    };

    const dateOption = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
            <Head title={`Ujian: ${test.title}`} />
            
            {/* HEADER */}
            <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center px-4 md:px-6 fixed top-0 inset-x-0 z-30 justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                        <Menu className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-sm md:text-lg font-bold text-gray-900 line-clamp-1">{test.title}</h1>
                        <p className="text-xs text-gray-500">Soal {currentIndex + 1} dari {questions.length}</p>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-3 text-xs md:text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{currentTime.toLocaleDateString('id-ID', dateOption)}</span>
                    </div>
                    <div className="w-px h-4 bg-gray-300"></div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="font-mono font-bold text-gray-800">{currentTime.toLocaleTimeString('id-ID')}</span>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="flex-1 pt-20 pb-8 px-4 md:px-6 max-w-[1600px] mx-auto w-full grid grid-cols-12 gap-6 items-start">
                {/* Sidebar Navigasi */}
                <aside className={`lg:col-span-3 lg:block lg:sticky lg:top-24 space-y-4 ${isSidebarOpen ? 'fixed inset-0 z-40 bg-white p-4 overflow-y-auto block' : 'hidden'}`}>
                    <div className="flex justify-between items-center lg:hidden mb-4">
                        <h3 className="font-bold text-lg">Navigasi Soal</h3>
                        <button onClick={() => setIsSidebarOpen(false)} className="text-gray-500 p-2 hover:bg-gray-100 rounded-full">✕</button>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                        <h3 className="font-bold text-gray-800 mb-4 flex justify-between items-center text-sm">
                            Progress
                            <span className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-bold border border-emerald-200">
                                {answeredCount}/{questions.length}
                            </span>
                        </h3>
                        <Navigation questions={questions} current={currentIndex} answers={answers} onJump={changeQuestion} />
                    </div>
                    <button onClick={() => setShowSubmitModal(true)} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all text-sm active:scale-95">
                        Selesai Ujian
                    </button>
                </aside>

                {/* Kartu Soal */}
                <section className="col-span-12 lg:col-span-6 flex flex-col gap-6">
                    <QuestionCard 
                        key={currentQuestion.id} 
                        question={currentQuestion}
                        selectedAnswer={answers[currentQuestion.id]}
                        testUserId={testUserId}
                        onAnswer={(val) => setAnswers(prev => ({...prev, [currentQuestion.id]: val}))}
                    />
                    <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm md:bg-transparent md:border-0 md:shadow-none md:p-0">
                        <button onClick={() => changeQuestion(currentIndex - 1)} disabled={currentIndex === 0} className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 font-bold shadow-sm transition-all">← Sebelumnya</button>
                        <button onClick={() => changeQuestion(currentIndex + 1)} disabled={currentIndex === questions.length - 1} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 font-bold shadow-md transition-all">Selanjutnya →</button>
                    </div>
                </section>

                {/* Sidebar Kanan (Timer) */}
                <aside className="hidden lg:block lg:col-span-3 lg:sticky lg:top-24 space-y-4">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className={`px-5 py-3 border-b border-gray-200 text-xs font-bold uppercase tracking-wider flex justify-between items-center ${timeLeft < 300 ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-500'}`}>
                            <span>Sisa Waktu</span>
                            {timeLeft < 300 && <AlertCircle className="w-4 h-4 animate-pulse" />}
                        </div>
                        <div className="p-6 flex justify-center">
                            <div className={`text-4xl font-mono font-bold tracking-widest ${timeLeft < 300 ? 'text-red-600 animate-pulse' : 'text-gray-800'}`}>
                                {formatTime(timeLeft)}
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">Peserta Ujian</div>
                        <div className="p-5">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-md shrink-0">{currentUser?.name?.charAt(0) || 'U'}</div>
                                <div className="flex-1 overflow-hidden">
                                    <h4 className="font-bold text-gray-900 text-sm truncate mb-1">{currentUser?.name || auth.user.name}</h4>
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-100 w-fit">
                                        <BookOpen className="w-3 h-3 text-gray-400" />
                                        <span className="font-mono tracking-wide">{currentUser?.npm || auth.user.username || '-'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            </main>

            <SubmitModal isOpen={showSubmitModal} onClose={() => setShowSubmitModal(false)} testUserId={testUserId} unanswered={questions.length - answeredCount} onSubmit={submitTest} />
        </div>
    );
}