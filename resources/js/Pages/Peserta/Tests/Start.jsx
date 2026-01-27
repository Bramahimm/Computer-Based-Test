import React, { useState, useEffect } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import axios from 'axios'; 
import { Menu, Clock, User, BookOpen, Calendar } from 'lucide-react';

// Import Komponen Anak
import QuestionCard from "./Components/QuestionCard";
import Timer from "./Components/Timer";
import Navigation from "./Components/Navigation";
import SubmitModal from "./Components/SubmitModal";

export default function Start({ test, testUserId, questions, remainingSeconds, existingAnswers, lastIndex, currentUser }) {
    
    const { auth } = usePage().props;

    // 1. STATE UTAMA
    const [currentIndex, setCurrentIndex] = useState(lastIndex || 0);
    const [answers, setAnswers] = useState(existingAnswers || {});
    
    // State UI
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    const currentQuestion = questions[currentIndex];

    // 🔥 LOGIC BARU: Hitung Progress yang Valid
    // Hanya menghitung jawaban jika ID soalnya benar-benar ada di daftar 'questions' saat ini.
    // Ini mencegah error "19/10" jika ada sisa data sampah di database.
    const answeredCount = questions.filter(q => {
        const userAnswer = answers[q.id];
        // Dianggap dijawab jika objectnya ada, DAN (answerId tidak null ATAU ada teks essay)
        return userAnswer && (
            userAnswer.answerId !== null || 
            (userAnswer.answerText && userAnswer.answerText.trim() !== "")
        );
    }).length;

    // 2. REAL-TIME CLOCK
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // 3. DISABLE CONTEXT MENU (Security)
    useEffect(() => {
        const handleContext = (e) => e.preventDefault();
        document.addEventListener('contextmenu', handleContext);
        return () => document.removeEventListener('contextmenu', handleContext);
    }, []);

    // 4. NAVIGASI & SYNC KE SERVER
    const changeQuestion = (newIndex) => {
        if (newIndex < 0 || newIndex >= questions.length) return;

        // Optimistic UI Update (Pindah dulu biar cepat)
        setCurrentIndex(newIndex);
        setIsSidebarOpen(false);

        // Sync ke Database (Background Process)
        const targetQuestionId = questions[newIndex].id;
        axios.post(route('peserta.tests.update_progress', testUserId), {
            index: newIndex,
            question_id: targetQuestionId
        }).catch(err => console.error("Gagal menyimpan posisi:", err));
    };

    // 5. SUBMIT UJIAN
    const submitTest = () => {
        router.post(route('peserta.tests.submit', testUserId), {}, {
            replace: true,
        });
    };

    // Helper Format Tanggal
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

                {/* TANGGAL & WAKTU */}
                <div className="hidden md:flex items-center gap-3 text-xs md:text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">
                            {currentTime.toLocaleDateString('id-ID', dateOption)}
                        </span>
                    </div>
                    <div className="w-px h-4 bg-gray-300"></div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="font-mono font-bold text-gray-800">
                            {currentTime.toLocaleTimeString('id-ID')}
                        </span>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="flex-1 pt-20 pb-8 px-4 md:px-6 max-w-[1600px] mx-auto w-full grid grid-cols-12 gap-6 items-start">
                
                {/* SIDEBAR KIRI (Navigasi) */}
                <aside className={`lg:col-span-3 lg:block lg:sticky lg:top-24 space-y-4 ${isSidebarOpen ? 'fixed inset-0 z-40 bg-white p-4 overflow-y-auto block' : 'hidden'}`}>
                    <div className="flex justify-between items-center lg:hidden mb-4">
                        <h3 className="font-bold text-lg">Navigasi Soal</h3>
                        <button onClick={() => setIsSidebarOpen(false)} className="text-gray-500 p-2 hover:bg-gray-100 rounded-full">✕</button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                        <h3 className="font-bold text-gray-800 mb-4 flex justify-between items-center text-sm">
                            Progress
                            <span className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-bold border border-emerald-200">
                                {/* 🔥 Menggunakan answeredCount yang sudah difilter */}
                                {answeredCount}/{questions.length}
                            </span>
                        </h3>
                        <Navigation 
                            questions={questions} 
                            current={currentIndex} 
                            answers={answers} 
                            onJump={changeQuestion} 
                        />
                    </div>

                    <button
                        onClick={() => setShowSubmitModal(true)}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all text-sm active:scale-95"
                    >
                        Selesai Ujian
                    </button>
                </aside>

                {/* TENGAH (Kartu Soal) */}
                <section className="col-span-12 lg:col-span-6 flex flex-col gap-6">
                    <QuestionCard 
                        key={currentQuestion.id} 
                        question={currentQuestion}
                        selectedAnswer={answers[currentQuestion.id]}
                        testUserId={testUserId}
                        onAnswer={(val) => setAnswers(prev => ({...prev, [currentQuestion.id]: val}))}
                    />

                    {/* Navigasi Bawah */}
                    <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm md:bg-transparent md:border-0 md:shadow-none md:p-0">
                        <button
                            onClick={() => changeQuestion(currentIndex - 1)}
                            disabled={currentIndex === 0}
                            className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-sm transition-all"
                        >
                            ← Sebelumnya
                        </button>
                        <button
                            onClick={() => changeQuestion(currentIndex + 1)}
                            disabled={currentIndex === questions.length - 1}
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-md transition-all hover:shadow-lg"
                        >
                            Selanjutnya →
                        </button>
                    </div>
                </section>

                {/* SIDEBAR KANAN (Info Peserta & Timer) */}
                <aside className="hidden lg:block lg:col-span-3 lg:sticky lg:top-24 space-y-4">
                    
                    {/* Timer Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Sisa Waktu
                        </div>
                        <div className="p-6 flex justify-center">
                            <Timer initialSeconds={remainingSeconds} onExpire={submitTest} />
                        </div>
                    </div>

                    {/* Participant Info Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Peserta Ujian
                        </div>
                        <div className="p-5">
                            <div className="flex items-start gap-4">
                                {/* Avatar */}
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-md shrink-0">
                                    {currentUser?.name?.charAt(0) || 'U'}
                                </div>
                                
                                <div className="flex-1 overflow-hidden">
                                    {/* Nama */}
                                    <h4 className="font-bold text-gray-900 text-sm truncate mb-1" title={currentUser?.name || auth.user.name}>
                                        {currentUser?.name || auth.user.name}
                                    </h4>
                                    
                                    {/* NPM / Username */}
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-100 w-fit">
                                        <BookOpen className="w-3 h-3 text-gray-400" />
                                        <span className="font-mono tracking-wide">
                                            {currentUser?.npm || currentUser?.username || auth.user.npm || auth.user.username || '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            </main>

            {/* MODAL */}
            <SubmitModal 
                isOpen={showSubmitModal} 
                onClose={() => setShowSubmitModal(false)}
                testUserId={testUserId}
                unanswered={questions.length - answeredCount} // Menggunakan hitungan yang benar
            />
        </div>
    );
}