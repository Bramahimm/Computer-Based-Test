import React, { useState } from 'react';
import axios from 'axios';
import { Trash2 } from 'lucide-react'; // Pastikan install/import icon ini

export default function AnswerOptions({ question, selectedAnswer, testUserId, onAnswer }) {
    const [isSaving, setIsSaving] = useState(false);

    // Logic Pilih Jawaban (TETAP SAMA)
    const handleSelect = async (answerId, answerText) => {
        if (isSaving || selectedAnswer?.answerId === answerId) return;

        onAnswer({ answerId, answerText });

        setIsSaving(true);
        try {
            await axios.post(route('peserta.tests.answer', testUserId), {
                question_id: question.id,
                answer_id: answerId,
            });
        } catch (error) {
            console.error("Gagal menyimpan jawaban", error);
            alert("Gagal menyimpan jawaban. Cek koneksi Anda.");
        } finally {
            setIsSaving(false);
        }
    };

    // 🔥 BARU: Logic Batal Jawab
    const handleClear = async () => {
        if (isSaving || !selectedAnswer?.answerId) return;

        // 1. Optimistic Update (Set null)
        onAnswer(null);

        // 2. Background Save (Kirim null ke server)
        setIsSaving(true);
        try {
            await axios.post(route('peserta.tests.answer', testUserId), {
                question_id: question.id,
                answer_id: null, // Null = Hapus jawaban
                answer_text: null
            });
        } catch (error) {
            console.error("Gagal menghapus jawaban", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-3">
            {/* Loop Jawaban (TETAP SAMA) */}
            {question.answers.map((option) => {
                const isSelected = selectedAnswer?.answerId === option.id;
                
                return (
                    <button
                        key={option.id}
                        onClick={() => handleSelect(option.id, option.answer_text)}
                        disabled={isSaving}
                        className={`
                            w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-start gap-4 group relative overflow-hidden
                            ${isSelected 
                                ? 'border-emerald-500 bg-emerald-50/50 shadow-md ring-1 ring-emerald-200' 
                                : 'border-gray-100 hover:border-emerald-200 hover:bg-gray-50'
                            }
                            ${isSaving ? 'cursor-wait opacity-70' : 'cursor-pointer'}
                        `}
                    >
                        <div className={`
                            w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors
                            ${isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300 group-hover:border-emerald-400'}
                        `}>
                            {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                        </div>

                        <div className="flex-1">
                            {option.answer_image && (
                                <img 
                                    src={`/storage/${option.answer_image}`} 
                                    className="mb-2 max-h-40 rounded-lg border border-gray-200" 
                                    alt="Opsi Gambar"
                                />
                            )}
                            <span className={`text-base leading-relaxed ${isSelected ? 'text-emerald-900 font-medium' : 'text-gray-700'}`}>
                                {option.answer_text}
                            </span>
                        </div>

                        {isSelected && (
                            <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-emerald-500" />
                        )}
                    </button>
                );
            })}

            {/* 🔥 BARU: Footer Action (Tombol Batal & Loading) */}
            <div className="flex justify-between items-center pt-2 mt-4 border-t border-gray-50">
                
                {/* Tombol Batal (Hanya muncul jika sudah menjawab) */}
                <div>
                    {selectedAnswer?.answerId && (
                        <button 
                            onClick={handleClear}
                            disabled={isSaving}
                            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors font-medium"
                        >
                            <Trash2 className="w-4 h-4" />
                            Batal Jawab
                        </button>
                    )}
                </div>

                {/* Status Simpan */}
                <div className="h-5 flex items-center">
                    {isSaving && (
                        <span className="text-xs text-emerald-600 animate-pulse font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-ping"></span>
                            Menyimpan...
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}