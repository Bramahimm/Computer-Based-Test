import React, { useState, useEffect } from "react";
import axios from 'axios';

export default function EssayInput({ question, selectedAnswer, testUserId, onAnswer }) {
    const [text, setText] = useState("");
    const [status, setStatus] = useState("idle"); // idle, saving, saved, error

    // Load jawaban yang sudah ada (jika user kembali ke soal ini)
    useEffect(() => {
        if (selectedAnswer?.answerText) {
            setText(selectedAnswer.answerText);
        }
    }, [selectedAnswer]);

    // EssayInput.jsx

const handleSave = async () => {
    if (text === selectedAnswer?.answerText) return;

    setStatus("saving");
    onAnswer({ answerText: text });

    try {
        // PERBAIKAN: Gunakan format objek untuk parameter testUser 
        // dan pastikan parameter name sesuai dengan {testUser} di web.php
        await axios.post(route("peserta.tests.answer", { testUser: testUserId }), {
            question_id: question.id,
            answer_text: text,
            answer_id: null // Tambahkan secara eksplisit null untuk essay
        });
        
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 2000);
    } catch (error) {
        console.error(error);
        setStatus("error");
    }
};

    return (
        <div className="space-y-2">
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onBlur={handleSave} // Simpan saat fokus lepas
                placeholder="Tulis jawaban Anda di sini..."
                className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all min-h-[200px] text-gray-800 leading-relaxed"
            />
            
            <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">
                    Klik di luar area teks untuk menyimpan.
                </span>
                
                {status === "saving" && (
                    <span className="text-emerald-600 animate-pulse font-medium">Menyimpan...</span>
                )}
                {status === "saved" && (
                    <span className="text-green-600 font-medium">✓ Tersimpan</span>
                )}
                {status === "error" && (
                    <span className="text-red-500 font-medium">⚠ Gagal menyimpan</span>
                )}
            </div>
        </div>
    );
}