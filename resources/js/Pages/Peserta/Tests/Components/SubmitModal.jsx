import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function SubmitModal({ isOpen, onClose, testUserId, unanswered }) {
    if (!isOpen) return null;

    const handleSubmit = () => {
        router.post(route('peserta.tests.submit', testUserId));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />

            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 text-center">
                <h3 className="text-xl font-bold mb-2">Kumpulkan Ujian?</h3>

                <p className="text-gray-500 mb-6">
                    {unanswered > 0
                        ? `Masih ada ${unanswered} soal belum dijawab.`
                        : 'Yakin ingin mengakhiri ujian?'}
                </p>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 border rounded-xl py-2.5"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="flex-1 py-2.5 rounded-xl text-white font-bold
                                   bg-emerald-600 hover:bg-emerald-700"
                    >
                        Ya, Kumpulkan
                    </button>
                </div>
            </div>
        </div>
    );
}