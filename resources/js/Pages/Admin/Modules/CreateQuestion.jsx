import React, { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import Button from "@/Components/UI/Button";
import { 
    XMarkIcon, PhotoIcon, PlusIcon, TrashIcon 
} from "@heroicons/react/24/outline";

export default function CreateQuestion({ show, onClose, mode, questionData, topicId }) {
    
    // Initial State
    const initialForm = {
        topic_id: topicId || "", 
        type: "multiple_choice",
        question_text: "",
        question_image: null, 
        options: [
            { text: "", is_correct: true, image: null, image_url: null },
            { text: "", is_correct: false, image: null, image_url: null },
            { text: "", is_correct: false, image: null, image_url: null },
            { text: "", is_correct: false, image: null, image_url: null },
        ],
    };

    const [form, setForm] = useState(initialForm);
    const [imagePreview, setImagePreview] = useState(null); // Preview untuk Soal

    // Reset / Populate Form
    useEffect(() => {
        if (show) {
            if (mode === 'edit' && questionData) {
                setForm({
                    topic_id: questionData.topic_id,
                    type: questionData.type,
                    question_text: questionData.question_text || "",
                    question_image: null,
                    options: questionData.type === "multiple_choice"
                        ? (questionData.answers || []).map((a) => ({
                            text: a.answer_text || "",
                            is_correct: !!a.is_correct,
                            image: null,
                            // Asumsi backend kirim path, kita buat URL manual jika belum ada accessor
                            image_url: a.answer_image ? `/storage/${a.answer_image}` : null 
                        }))
                        : initialForm.options,
                });
                setImagePreview(questionData.question_image_url || (questionData.question_image ? `/storage/${questionData.question_image}` : null));
            } else {
                setForm({ ...initialForm, topic_id: topicId });
                setImagePreview(null);
            }
        }
    }, [show, mode, questionData, topicId]);

    // --- HANDLER GAMBAR SOAL ---
    const handleImageChange = (e) => {
        const file = e.target.files?.[0] || null;
        setForm((prev) => ({ ...prev, question_image: file }));
        if (file) setImagePreview(URL.createObjectURL(file));
        else setImagePreview(null);
    };

    const removeImage = (e) => {
        e.stopPropagation();
        setForm(prev => ({ ...prev, question_image: null }));
        setImagePreview(null);
    };

    // --- HANDLER OPSI JAWABAN ---
    const setCorrectOption = (idx) => {
        setForm((prev) => ({
            ...prev,
            options: prev.options.map((o, i) => ({ ...o, is_correct: i === idx })),
        }));
    };

    const handleOptionTextChange = (idx, val) => {
        setForm(prev => ({
            ...prev,
            options: prev.options.map((o, i) => i === idx ? { ...o, text: val } : o)
        }));
    };

    const handleOptionImageChange = (idx, e) => {
        const file = e.target.files?.[0];
        if (file) {
            setForm(prev => ({
                ...prev,
                options: prev.options.map((o, i) => i === idx ? { 
                    ...o, 
                    image: file, 
                    image_url: URL.createObjectURL(file) 
                } : o)
            }));
        }
    };

    const removeOptionImage = (idx) => {
        setForm(prev => ({
            ...prev,
            options: prev.options.map((o, i) => i === idx ? { ...o, image: null, image_url: null } : o)
        }));
    };

    const addOption = () => {
        setForm((prev) => ({
            ...prev,
            options: [...prev.options, { text: "", is_correct: false, image: null, image_url: null }],
        }));
    };

    const removeOption = (idx) => {
        setForm((prev) => {
            const next = prev.options.filter((_, i) => i !== idx);
            if (!next.some((o) => o.is_correct) && next.length > 0) {
                next[0].is_correct = true;
            }
            return { ...prev, options: next };
        });
    };

    // --- SUBMIT ---
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // PENTING: Gunakan FormData manual karena ada file dalam array options
        const formData = new FormData();
        formData.append('topic_id', form.topic_id);
        formData.append('type', form.type);
        
        if (form.question_text) formData.append('question_text', form.question_text);
        if (form.question_image) formData.append('question_image', form.question_image);

        if (form.type === "multiple_choice") {
            form.options.forEach((opt, index) => {
                // Kirim text (bisa null string jika kosong)
                formData.append(`options[${index}][text]`, opt.text || ""); 
                formData.append(`options[${index}][is_correct]`, opt.is_correct ? '1' : '0');
                
                // Kirim Gambar Jawaban (Hanya jika upload baru)
                if (opt.image instanceof File) {
                    formData.append(`options[${index}][image]`, opt.image);
                }
            });
        }

        // Config request
        const options = {
            preserveScroll: true,
            preserveState: true,
            forceFormData: true, // Wajib agar Inertia mengirim sebagai FormData
            onSuccess: () => onClose(),
        };

        if (mode === "create") {
            router.post(route("admin.questions.store"), formData, options);
        } else {
            // Trik untuk PUT method dengan file di Laravel
            formData.append('_method', 'PUT');
            router.post(route("admin.questions.update", questionData.id), formData, options);
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
                
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-gray-800">
                        {mode === "create" ? "Tambah Soal Baru" : "Edit Soal"}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <XMarkIcon className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        
                        {/* KOLOM KIRI: Konten Soal */}
                        <div className="lg:col-span-7 space-y-6">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Pertanyaan</label>
                                <textarea
                                    className="w-full border-gray-200 rounded-xl px-4 py-3 min-h-[150px] focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    placeholder="Tulis pertanyaan di sini..."
                                    value={form.question_text}
                                    onChange={(e) => setForm(prev => ({ ...prev, question_text: e.target.value }))}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Gambar Soal (Opsional)</label>
                                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={handleImageChange}
                                    />
                                    {imagePreview ? (
                                        <div className="relative inline-block">
                                            <img src={imagePreview} alt="Preview" className="max-h-64 rounded-lg shadow-sm" />
                                            <button 
                                                type="button"
                                                onClick={removeImage}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600"
                                            >
                                                <XMarkIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="py-8 text-gray-400 flex flex-col items-center gap-2">
                                            <PhotoIcon className="w-12 h-12 text-gray-300" />
                                            <span className="text-sm">Klik atau drag gambar ke sini</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* KOLOM KANAN: Tipe & Opsi */}
                        <div className="lg:col-span-5 space-y-6">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Tipe Soal</label>
                                <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-lg">
                                    {["multiple_choice", "essay"].map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setForm(prev => ({ ...prev, type: type }))}
                                            className={`py-2 px-4 rounded-md text-sm font-bold transition-all ${form.type === type ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                                        >
                                            {type === "multiple_choice" ? "Pilihan Ganda" : "Essay"}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {form.type === "multiple_choice" && (
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                    <div className="flex justify-between items-center mb-4">
                                        <label className="text-xs font-bold uppercase text-gray-400">Opsi Jawaban</label>
                                        <button type="button" onClick={addOption} className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                            <PlusIcon className="w-3 h-3" /> Tambah Opsi
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {form.options.map((opt, idx) => (
                                            <div key={idx} className="flex flex-col gap-2 p-3 bg-white rounded-lg border border-gray-200 shadow-sm relative group">
                                                
                                                {/* Baris Input: Radio + Text + Delete */}
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="radio"
                                                        name="correct_option"
                                                        checked={opt.is_correct}
                                                        onChange={() => setCorrectOption(idx)}
                                                        className="w-5 h-5 text-green-600 focus:ring-green-500 cursor-pointer border-gray-300"
                                                    />
                                                    
                                                    {/* Input Text & Tombol Image */}
                                                    <div className="flex-1 flex items-center gap-2 relative">
                                                        <input
                                                            type="text"
                                                            className={`flex-1 text-sm rounded-lg pl-3 pr-10 py-2 border transition-all ${opt.is_correct ? 'border-green-500 ring-1 ring-green-500 bg-white' : 'border-gray-200 focus:border-blue-500'}`}
                                                            placeholder={`Pilihan ${idx + 1}`}
                                                            value={opt.text}
                                                            onChange={(e) => handleOptionTextChange(idx, e.target.value)}
                                                        />
                                                        
                                                        {/* Tombol Upload Kecil di dalam Input */}
                                                        <label className="cursor-pointer text-gray-400 hover:text-blue-600 absolute right-2">
                                                            <PhotoIcon className="w-5 h-5" />
                                                            <input 
                                                                type="file" 
                                                                className="hidden" 
                                                                accept="image/*"
                                                                onChange={(e) => handleOptionImageChange(idx, e)}
                                                            />
                                                        </label>
                                                    </div>

                                                    {form.options.length > 2 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeOption(idx)}
                                                            className="text-gray-300 hover:text-red-500 transition-colors"
                                                        >
                                                            <TrashIcon className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Preview Image Jawaban */}
                                                {opt.image_url && (
                                                    <div className="ml-8 relative inline-block w-max">
                                                        <img src={opt.image_url} alt="Option" className="h-20 w-auto rounded border border-gray-200" />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeOptionImage(idx)}
                                                            className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-0.5 hover:bg-red-200"
                                                        >
                                                            <XMarkIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-3 text-center">*Klik radio button untuk kunci jawaban. Klik ikon foto untuk upload gambar jawaban.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                        <Button type="button" variant="secondary" onClick={onClose} className="bg-gray-100 text-gray-600 hover:bg-gray-200 border-none">
                            Batal
                        </Button>
                        <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200">
                            {mode === "create" ? "Simpan Soal" : "Simpan Perubahan"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}