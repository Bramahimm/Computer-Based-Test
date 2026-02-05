    import React, { useState } from 'react';
    import jsPDF from 'jspdf';
    import autoTable from 'jspdf-autotable';
    import { Download, Loader2 } from 'lucide-react';

    export default function ExportPdfStatistics({ test, stats, questions }) {
        const [isGenerating, setIsGenerating] = useState(false);

        // --- 1. LOAD FONT ROBOTO (Wajib agar simbol muncul) ---
        const loadFont = async (doc) => {
            try {
                // URL Font Roboto (Support simbol matematika & unicode)
                const fontURL = "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf";
                const response = await fetch(fontURL);
                if (!response.ok) throw new Error("Gagal download font");
                
                const blob = await response.blob();
                const reader = new FileReader();
                
                return new Promise((resolve) => {
                    reader.onloadend = () => {
                        // Ambil base64 murni (hapus 'data:font/ttf;base64,')
                        const base64data = reader.result.split(',')[1];
                        
                        // Tambahkan ke VFS jsPDF
                        doc.addFileToVFS("Roboto-Regular.ttf", base64data);
                        doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
                        doc.setFont("Roboto"); // Set aktif
                        resolve(true);
                    };
                    reader.readAsDataURL(blob);
                });
            } catch (e) {
                console.error("Gagal memuat font kustom, simbol mungkin tidak muncul.", e);
                return false; // Lanjut dengan font standar jika gagal
            }
        };

        // --- 2. DOWNLOAD GAMBAR ---
        const getBase64ImageFromURL = (url) => {
            return new Promise((resolve) => {
                if (!url) { resolve(null); return; }
                const img = new Image();
                img.setAttribute("crossOrigin", "anonymous");
                img.src = url.startsWith('http') ? url : `/storage/${url}`;
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0);
                    resolve(canvas.toDataURL("image/jpeg"));
                };
                img.onerror = () => resolve(null);
            });
        };

        // --- 3. BERSIHKAN HTML (TAPI JANGAN UBAH SIMBOL) ---
        const stripHtml = (html) => {
            if (!html) return "";

            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = html;

            // Hapus elemen sampah KaTeX (MathML) yang bikin teks ganda
            const mathML = tempDiv.querySelectorAll('math, .katex-mathml, annotation');
            mathML.forEach(el => el.remove());

            // Hapus style/script
            const scripts = tempDiv.querySelectorAll('script, style');
            scripts.forEach(el => el.remove());

            // Ambil teks murni (Simbol α, β, ° akan tetap utuh)
            // Kita TIDAK melakukan replace manual lagi disini.
            return (tempDiv.textContent || tempDiv.innerText || "").trim().replace(/\s+/g, ' ');
        };

        const exportPDF = async () => {
            setIsGenerating(true);
            const doc = new jsPDF();

            // 🔥 STEP 1: Tunggu Load Font Dulu!
            await loadFont(doc);

            // Header
            doc.setFontSize(12); doc.setFont("Roboto", "bold");
            doc.text("FAKULTAS KEDOKTERAN", 14, 15);
            doc.text("UNIVERSITAS LAMPUNG", 14, 21);
            doc.setFontSize(9); doc.setFont("Roboto", "normal");
            doc.text("Jalan Soemantri Brojonegoro no.1 Gedung B lt.3", 14, 27);
            doc.setLineWidth(0.5); doc.line(14, 30, 196, 30);

            // Info Ujian
            doc.setFontSize(14); doc.setFont("Roboto", "bold");
            doc.text("Laporan Analisis Butir Soal", 14, 40);
            doc.setFontSize(10); doc.setFont("Roboto", "normal");
            doc.text(`Mata Kuliah  : ${test?.title || '-'}`, 14, 48);
            doc.text(`Kode   : ${test?.code || '-'}`, 14, 53);
            doc.text(`Peserta: ${stats?.total_participants || 0} Mahasiswa`, 14, 58);

            let finalY = 65;

            // Loop Soal
            for (let i = 0; i < questions.length; i++) {
                const q = questions[i];
                
                // Cek Halaman Baru
                if (finalY > 250) { doc.addPage(); finalY = 20; }

                // Tabel Statistik
                autoTable(doc, {
                    startY: finalY,
                    head: [['#', 'Tampil', 'Benar', 'Salah', 'Kosong']],
                    body: [[
                        i + 1, 
                        `${q.stats.recurrence}`, 
                        `${q.stats.correct} (${q.stats.correct_pct}%)`,
                        `${q.stats.wrong} (${q.stats.wrong_pct}%)`,
                        `${q.stats.unanswered} (${q.stats.unanswered_pct}%)`
                    ]],
                    theme: 'grid',
                    styles: { fontSize: 9, halign: 'center', font: 'Roboto' }, // Gunakan Roboto
                    headStyles: { fillColor: [230, 230, 230], textColor: 0, fontStyle: 'bold' },
                    margin: { left: 14, right: 14 }
                });
                finalY = doc.lastAutoTable.finalY + 5;

                // Gambar Soal
                if (q.question_image) {
                    try {
                        const imgData = await getBase64ImageFromURL(q.question_image);
                        if (imgData) {
                            const imgProps = doc.getImageProperties(imgData);
                            const pdfWidth = 80; 
                            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                            if (finalY + pdfHeight > 270) { doc.addPage(); finalY = 20; }
                            doc.addImage(imgData, 'JPEG', 14, finalY, pdfWidth, pdfHeight);
                            finalY += pdfHeight + 5;
                        }
                    } catch(e) { console.error(e); }
                }

                // Teks Soal
                const cleanQuestion = stripHtml(q.question_text || "");
                doc.setFont("Roboto", "bold"); doc.setFontSize(10);
                
                const splitTitle = doc.splitTextToSize(cleanQuestion, 180);
                if (finalY + (splitTitle.length * 5) > 270) { doc.addPage(); finalY = 20; }
                
                doc.text(splitTitle, 14, finalY);
                finalY += (splitTitle.length * 5) + 3;

                // Jawaban
                if (q.answers && q.answers.length > 0) {
                    const answerData = q.answers.map((ans, idx) => {
                        const letter = String.fromCharCode(65 + idx);
                        const cleanAns = stripHtml(ans.answer_text || "");
                        const isKey = ans.is_correct ? '✔' : ''; // Pakai simbol centang
                        return [
                            letter, 
                            cleanAns + "  " + isKey, 
                            `${ans.selection_count} (${ans.selection_pct}%)`
                        ];
                    });

                    autoTable(doc, {
                        startY: finalY,
                        body: answerData,
                        theme: 'plain',
                        styles: { fontSize: 9, cellPadding: 1, font: 'Roboto' }, // Gunakan Roboto
                        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 8 }, 2: { halign: 'right', cellWidth: 35 } },
                        margin: { left: 14, right: 14 },
                        didDrawCell: (data) => {
                            if (data.section === 'body' && q.answers[data.row.index].is_correct) {
                                doc.setTextColor(0, 128, 0); // Warna Hijau
                            }
                        }
                    });
                    doc.setTextColor(0, 0, 0); 
                    finalY = doc.lastAutoTable.finalY + 10;
                } else {
                    doc.setFont("Roboto", "italic"); doc.setFontSize(9);
                    doc.text("(Soal Esai - Lihat detail di web)", 14, finalY);
                    finalY += 10;
                }
            }

            doc.save(`Statistik_${test?.title || 'Ujian'}.pdf`);
            setIsGenerating(false);
        };

        return (
            <button 
                onClick={exportPDF}
                disabled={isGenerating}
                className={`bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm ${isGenerating ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {isGenerating ? 'Memproses PDF...' : 'Download PDF'}
            </button>
        );
    }