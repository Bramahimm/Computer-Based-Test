import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { 
    ArrowLeft, Users, TrendingUp, CheckCircle, XCircle, 
    Award, Clock, AlertCircle, FileText, HelpCircle 
} from 'lucide-react';

export default function Statistics({ test, summary }) {
    // Destructuring data dari backend
    const { stats, distribution, top_students, questions = [] } = summary;

    // Transformasi data distribusi untuk Recharts
    const chartData = Object.keys(distribution).map(range => ({
        name: range,
        count: distribution[range]
    }));

    const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
            <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
                <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
            </div>
        </div>
    );

    return (
        <AdminLayout>
            <Head title={`Statistik: ${test.title}`} />

            <div className="space-y-8 pb-20">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <Link 
                            href={route('admin.tests.index', { section: 'statistic' })} 
                            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-2 text-sm transition-colors font-medium"
                        >
                            <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Ujian
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">Laporan Analisis Ujian</h1>
                        <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-bold border border-blue-100">
                                {test.code || 'NO-CODE'}
                            </span>
                            <span>{test.title}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard 
                        title="Total Peserta" 
                        value={stats.total_participants} 
                        icon={Users} 
                        color="text-blue-600 bg-blue-600"
                        subtext="Siswa yang submit"
                    />
                    <StatCard 
                        title="Rata-Rata Nilai" 
                        value={stats.average_score} 
                        icon={TrendingUp} 
                        color="text-purple-600 bg-purple-600"
                    />
                    <StatCard 
                        title="Lulus KKM" 
                        value={stats.passed_count} 
                        icon={CheckCircle} 
                        color="text-emerald-600 bg-emerald-600"
                        subtext="Nilai ≥ 75" 
                    />
                    <StatCard 
                        title="Di Bawah KKM" 
                        value={stats.failed_count} 
                        icon={XCircle} 
                        color="text-red-600 bg-red-600"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                        <div className="mb-6">
                            <h3 className="font-bold text-lg text-gray-900">Distribusi Nilai Peserta</h3>
                            <p className="text-sm text-gray-500">Sebaran nilai berdasarkan rentang skor</p>
                        </div>
                        <div className="w-full h-[320px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                                    <Tooltip 
                                        cursor={{fill: '#f9fafb'}}
                                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                                    />
                                    <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={50}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index > 2 ? '#10b981' : '#6366f1'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-[430px]">
                        <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                            <Award className="w-5 h-5 text-yellow-500" /> Peringkat Tertinggi
                        </h3>
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                            {top_students.length > 0 ? (
                                top_students.map((student, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-transparent hover:border-gray-200 transition-all">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className={`
                                                w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm
                                                ${idx === 0 ? 'bg-yellow-400' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-orange-400' : 'bg-indigo-100 text-indigo-600'}
                                            `}>
                                                {idx + 1}
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="text-sm font-bold text-gray-900 truncate" title={student.name}>{student.name}</h4>
                                                <div className="flex items-center gap-1 text-[10px] text-gray-500">
                                                    <Clock className="w-3 h-3" /> {student.finished_at}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0 pl-2">
                                            <span className="block text-lg font-extrabold text-emerald-600">{student.score}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                    <Users className="w-10 h-10 mb-2 opacity-20" />
                                    <p className="text-sm">Belum ada data peserta.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 bg-gray-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-gray-500" /> Analisis Butir Soal
                            </h3>
                            <p className="text-sm text-gray-500">Statistik detail performa setiap pertanyaan dan opsi jawaban.</p>
                        </div>
                        <div className="flex gap-4 text-xs font-medium text-gray-600 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Benar</div>
                            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Salah</div>
                            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-gray-300"></span> Kosong</div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-100 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 w-16 text-center">#</th>
                                    <th className="px-6 py-3">Konten Pertanyaan & Statistik Opsi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {questions.length > 0 ? questions.map((q, index) => (
                                    <React.Fragment key={q.id}>
                                        <tr className="bg-amber-50 border-b border-amber-100">
                                            <td className="px-4 py-3 text-center font-bold text-amber-700 border-r border-amber-100 bg-amber-100/50">
                                                {index + 1}
                                            </td>
                                            <td className="px-6 py-2">
                                                <div className="flex flex-wrap gap-x-8 gap-y-2 text-xs font-bold tracking-wide">
                                                    <div className="flex items-center gap-2 text-gray-600" title="Jumlah Siswa Mendapat Soal Ini">
                                                        <HelpCircle className="w-4 h-4 text-gray-400" />
                                                        <span>Tampil: <span className="text-gray-900 text-sm">{q.stats.recurrence}</span></span>
                                                    </div>
                                                    <div className="w-px h-5 bg-amber-200 mx-2 hidden md:block"></div>
                                                    <div className="flex items-center gap-2 text-emerald-700" title="Menjawab Benar">
                                                        <CheckCircle className="w-4 h-4" />
                                                        <span>Benar: {q.stats.correct} ({q.stats.correct_pct}%)</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-red-700" title="Menjawab Salah">
                                                        <XCircle className="w-4 h-4" />
                                                        <span>Salah: {q.stats.wrong} ({q.stats.wrong_pct}%)</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-500" title="Tidak Menjawab">
                                                        <AlertCircle className="w-4 h-4" />
                                                        <span>Kosong: {q.stats.unanswered} ({q.stats.unanswered_pct}%)</span>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>

                                        <tr className="bg-white">
                                            <td className="border-r border-gray-100"></td>
                                            <td className="px-6 py-5 text-gray-800">
                                                <div 
                                                    dangerouslySetInnerHTML={{ __html: q.question_text }} 
                                                    className="prose prose-sm max-w-none mb-4 text-gray-800"
                                                />

                                                <div className="space-y-2 mt-4">
                                                    {q.answers.map((ans, idx) => (
                                                        <div key={idx} className="flex items-center gap-4 group">
                                                            <div className={`
                                                                w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border shrink-0
                                                                ${ans.is_correct 
                                                                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                                                                    : 'bg-gray-50 text-gray-500 border-gray-200'}
                                                            `}>
                                                                {String.fromCharCode(65 + idx)}
                                                            </div>

                                                            <div className="flex-1 relative h-9 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 flex items-center px-3">
                                                                <div 
                                                                    className={`absolute left-0 top-0 bottom-0 transition-all duration-500 ${ans.is_correct ? 'bg-emerald-100/60' : 'bg-indigo-50/60'}`} 
                                                                    style={{ width: `${ans.selection_pct}%` }}
                                                                ></div>
                                                                <div className="relative z-10 flex justify-between items-center w-full text-xs">
                                                                    <span className={`font-medium truncate pr-4 ${ans.is_correct ? 'text-emerald-800' : 'text-gray-600'}`}>
                                                                        {ans.answer_text} 
                                                                        {ans.is_correct && <span className="ml-2 text-[9px] bg-emerald-500 text-white px-1.5 py-0.5 rounded uppercase tracking-wider">Kunci</span>}
                                                                    </span>
                                                                    <span className="font-bold text-gray-700 font-mono">
                                                                        {ans.selection_count} siswa ({ans.selection_pct}%)
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                        <tr><td colSpan="2" className="h-4 bg-gray-50/30 border-b border-gray-100"></td></tr>
                                    </React.Fragment>
                                )) : (
                                    <tr>
                                        <td colSpan="2" className="p-12 text-center text-gray-400">
                                            <FileText className="w-16 h-16 mx-auto mb-3 opacity-20" />
                                            <p className="text-lg font-medium text-gray-500">Belum ada data analisis.</p>
                                            <p className="text-sm">Data akan muncul setelah siswa menyelesaikan ujian.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
