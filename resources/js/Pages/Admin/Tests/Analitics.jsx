import React, { useMemo, useState, useEffect } from "react";
import { Head, router } from "@inertiajs/react";
import {
  Clock, CheckCircle, XCircle, AlertCircle,
  BookOpen, ChevronRight, Plus, BarChart3, User
} from "lucide-react";

export default function Analitics({ testUsers = [] }) {
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [selectedUserTestId, setSelectedUserTestId] = useState(null);
  const [addTimeInput, setAddTimeInput] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  // Auto-refresh setiap 10 detik
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(interval);
  }, []);

  // Filter hanya ujian yang sedang berlangsung
  const ongoingData = useMemo(() => {
    const ongoing = testUsers.filter(tu => tu.finished_at === null);

    const testsByTest = {};

    ongoing.forEach((testUser) => {
      const testId = testUser.test_id;
      const testTitle = testUser.test?.title || "Unknown";

      if (!testsByTest[testId]) {
        testsByTest[testId] = {
          testId,
          title: testTitle,
          duration: testUser.test?.duration || 0,
          testUsers: [],
        };
      }
      testsByTest[testId].testUsers.push(testUser);
    });

    return {
      testsByTest,
      allOngoingTests: Object.values(testsByTest),
    };
  }, [testUsers, currentTime]);

  // Get users untuk test yang dipilih
  const usersInSelectedTest = useMemo(() => {
    if (!selectedTestId || !ongoingData.testsByTest[selectedTestId]) {
      return [];
    }
    return ongoingData.testsByTest[selectedTestId].testUsers;
  }, [selectedTestId, ongoingData.testsByTest]);

  // Get detail user yang dipilih
  const selectedUserTest = useMemo(() => {
    if (!selectedUserTestId) return null;
    return usersInSelectedTest.find(u => u.id === selectedUserTestId) || null;
  }, [selectedUserTestId, usersInSelectedTest]);

  // Format time
  const formatTime = (timeStr) => {
    if (!timeStr) return "-";
    const date = new Date(timeStr);
    return date.toLocaleString('id-ID');
  };

  // Calculate remaining time
  const calculateRemainingTime = (startedAt, testDuration) => {
    if (!startedAt) return testDuration;
    const started = new Date(startedAt);
    const now = new Date();
    const elapsed = Math.floor((now - started) / (1000 * 60));
    const remaining = testDuration - elapsed;
    return Math.max(0, remaining);
  };

  // Get status color
  const getStatusColor = (remainingMinutes) => {
    if (remainingMinutes <= 5) return 'bg-red-100 text-red-700 border-red-300';
    if (remainingMinutes <= 15) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    return 'bg-green-100 text-green-700 border-green-300';
  };

  // Detail View - Ketika user dipilih
  if (selectedUserTest) {
    const userAnswers = selectedUserTest.user_answers || [];
    const testDuration = selectedUserTest.test?.duration || 0;
    const remainingTime = calculateRemainingTime(selectedUserTest.started_at, testDuration);
    const totalQuestions = selectedUserTest.test?.questions?.length || 0;
    const answeredCount = userAnswers.filter(a => a.answer_id).length;
    const unansweredCount = totalQuestions - answeredCount;

    return (
      <>
        <Head title="Detail Ujian Berlangsung" />
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/30">
            <button
              onClick={() => setSelectedUserTestId(null)}
              className="text-sm text-gray-500 hover:text-gray-900 mb-2 flex items-center gap-2 font-medium"
            >
              ← Kembali ke Daftar Peserta
            </button>
            <h1 className="text-xl font-bold text-gray-900">{selectedUserTest.test?.title}</h1>
            <p className="text-xs text-gray-500 mt-1">Peserta: {selectedUserTest.user?.name} ({selectedUserTest.user?.email})</p>
          </div>

          <div className="p-8 space-y-8">
            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              {/* Sisa Waktu */}
              <div className={`p-4 rounded-lg border-2 ${getStatusColor(remainingTime)}`}>
                <p className="text-xs font-semibold uppercase mb-1">Sisa Waktu</p>
                <p className="text-2xl font-bold font-mono">{Math.max(0, remainingTime)}</p>
                <p className="text-xs mt-1">menit</p>
              </div>

              {/* Nilai Sementara */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                <p className="text-xs font-semibold text-purple-600 uppercase">Nilai Sementara</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">
                  {userAnswers.filter(a => a.is_correct).length * (100 / totalQuestions || 0) | 0}
                </p>
              </div>

              {/* Dikerjakan */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <p className="text-xs font-semibold text-blue-600 uppercase">Dikerjakan</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">{answeredCount}/{totalQuestions}</p>
              </div>

              {/* Benar */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                <p className="text-xs font-semibold text-green-600 uppercase">Benar</p>
                <p className="text-2xl font-bold text-green-900 mt-1">{userAnswers.filter(a => a.is_correct).length}</p>
              </div>

              {/* Salah */}
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
                <p className="text-xs font-semibold text-red-600 uppercase">Salah</p>
                <p className="text-2xl font-bold text-red-900 mt-1">
                  {userAnswers.filter(a => !a.is_correct && a.answer_id).length}
                </p>
              </div>

              {/* Belum Dijawab */}
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
                <p className="text-xs font-semibold text-yellow-600 uppercase">Belum Dijawab</p>
                <p className="text-2xl font-bold text-yellow-900 mt-1">{unansweredCount}</p>
              </div>
            </div>

            {/* Waktu Detail */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 rounded-lg border border-gray-200 bg-white">
                <p className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Mulai Ujian
                </p>
                <p className="text-gray-900 font-mono text-sm">{formatTime(selectedUserTest.started_at)}</p>
              </div>

              <div className="p-6 rounded-lg border border-gray-200 bg-white">
                <p className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Durasi Ujian
                </p>
                <p className="text-gray-900 font-mono text-sm">{testDuration} menit</p>
              </div>
            </div>

            {/* Tambah Waktu */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Tambah Waktu Ujian
              </h3>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={addTimeInput}
                  onChange={(e) => setAddTimeInput(e.target.value)}
                  placeholder="Masukkan menit tambahan"
                  className="flex-1 px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="120"
                />
                <button
                  onClick={() => {
                    if (addTimeInput && parseInt(addTimeInput) > 0) {
                      router.post(
                        route('admin.monitoring.forceSubmit', selectedUserTest.id),
                        { extend_minutes: parseInt(addTimeInput) },
                        {
                          onSuccess: () => {
                            setAddTimeInput("");
                            alert(`Waktu ujian ${selectedUserTest.user?.name} ditambah ${addTimeInput} menit`);
                          }
                        }
                      );
                    }
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  + Tambah
                </button>
              </div>
            </div>

            {/* Detail Jawaban */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="font-bold text-lg text-gray-900">
                  Detail Pertanyaan & Jawaban ({answeredCount}/{totalQuestions})
                </h3>
              </div>

              <div className="divide-y divide-gray-200">
                {selectedUserTest.test?.questions && selectedUserTest.test.questions.length > 0 ? (
                  selectedUserTest.test.questions.map((question, qIdx) => {
                    const userAnswer = userAnswers.find(a => a.question_id === question.id);
                    const isCorrect = userAnswer?.is_correct;
                    const answeredChoice = userAnswer?.answer;

                    return (
                      <div key={qIdx} className="p-6 hover:bg-gray-50 transition">
                        <div className="flex items-start gap-4">
                          {/* Status Icon */}
                          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                            isCorrect
                              ? 'bg-green-100 text-green-700'
                              : userAnswer?.answer_id
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {isCorrect ? <CheckCircle className="w-5 h-5" /> : userAnswer?.answer_id ? <XCircle className="w-5 h-5" /> : '?'}
                          </div>

                          <div className="flex-1 min-w-0">
                            {/* Nomor & Status */}
                            <p className="font-semibold text-gray-900 mb-3">
                              Pertanyaan {qIdx + 1}
                              {isCorrect && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded ml-2">✓ Benar</span>}
                              {!isCorrect && userAnswer?.answer_id && <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded ml-2">✗ Salah</span>}
                              {!userAnswer?.answer_id && <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded ml-2">? Belum Dijawab</span>}
                            </p>

                            {/* Soal */}
                            <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200">
                              <p className="text-sm text-gray-700" dangerouslySetInnerHTML={{
                                __html: question.question_text || 'Tidak ada teks pertanyaan'
                              }}></p>
                            </div>

                            {/* Pilihan Jawaban */}
                            <div className="space-y-2 mb-4">
                              {question.answers && question.answers.map((answer, aIdx) => {
                                const isSelected = userAnswer?.answer_id === answer.id;
                                const isCorrectAnswer = answer.is_correct;
                                const shouldHighlight = isSelected || isCorrectAnswer;

                                return (
                                  <div
                                    key={aIdx}
                                    className={`p-3 rounded-lg border-2 ${
                                      isSelected && isCorrect
                                        ? 'border-green-400 bg-green-50'
                                        : isSelected && !isCorrect
                                        ? 'border-red-400 bg-red-50'
                                        : isCorrectAnswer && !isSelected
                                        ? 'border-blue-400 bg-blue-50'
                                        : 'border-gray-200 bg-white'
                                    }`}
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className={`flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                                        isSelected && isCorrect ? 'bg-green-500 text-white' :
                                        isSelected && !isCorrect ? 'bg-red-500 text-white' :
                                        isCorrectAnswer ? 'bg-blue-500 text-white' :
                                        'bg-gray-300 text-gray-600'
                                      }`}>
                                        {String.fromCharCode(65 + aIdx)}
                                      </div>
                                      <div className="flex-1">
                                        <p className={`text-sm ${
                                          isSelected && isCorrect ? 'text-green-900 font-semibold' :
                                          isSelected && !isCorrect ? 'text-red-900 font-semibold' :
                                          isCorrectAnswer ? 'text-blue-900 font-semibold' :
                                          'text-gray-700'
                                        }`}>
                                          {answer.answer_text}
                                        </p>
                                        {isSelected && <p className="text-xs text-gray-500 mt-1">✓ Jawaban Peserta</p>}
                                        {isCorrectAnswer && !isSelected && <p className="text-xs text-blue-600 mt-1">✓ Jawaban Benar</p>}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-12 text-center text-gray-400">
                    <p>Tidak ada pertanyaan</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // View Utama - Filter Test & User
  return (
    <>
      <Head title="Analytics - Ujian Berlangsung" />

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/30">
          <h1 className="text-xl font-bold text-gray-900">📊 Detail Ujian Berlangsung</h1>
          <p className="text-xs text-gray-500 mt-1">
            Pilih ujian dan peserta untuk melihat detail pertanyaan, jawaban, dan kelola waktu
          </p>
        </div>

        <div className="p-8 space-y-8">
          {/* Filter Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Filter Test */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Pilih Ujian
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {ongoingData.allOngoingTests.length > 0 ? (
                  ongoingData.allOngoingTests.map((test) => (
                    <button
                      key={test.testId}
                      onClick={() => {
                        setSelectedTestId(test.testId);
                        setSelectedUserTestId(null);
                      }}
                      className={`w-full text-left p-4 rounded-lg border-2 transition ${
                        selectedTestId === test.testId
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <p className="font-semibold text-gray-900">{test.title}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        👥 {test.testUsers.length} peserta • ⏱️ {test.duration} menit
                      </p>
                    </button>
                  ))
                ) : (
                  <p className="text-center text-gray-400 py-8">
                    Tidak ada ujian yang sedang berlangsung
                  </p>
                )}
              </div>
            </div>

            {/* Filter User */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Pilih Peserta
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {usersInSelectedTest.length > 0 ? (
                  usersInSelectedTest.map((testUser) => {
                    const remaining = calculateRemainingTime(testUser.started_at, testUser.test?.duration || 0);
                    const answered = (testUser.user_answers || []).filter(a => a.answer_id).length;
                    const total = testUser.test?.questions?.length || 0;

                    return (
                      <button
                        key={testUser.id}
                        onClick={() => setSelectedUserTestId(testUser.id)}
                        className={`w-full text-left p-4 rounded-lg border transition ${
                          selectedUserTestId === testUser.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-gray-900">{testUser.user?.name}</p>
                            <p className="text-xs text-gray-500">{testUser.user?.email}</p>
                          </div>
                          <div className={`px-2 py-1 rounded text-xs font-bold border ${getStatusColor(remaining)}`}>
                            {remaining}m
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">
                          ✓ {answered}/{total} dikerjakan
                        </p>
                      </button>
                    );
                  })
                ) : (
                  <p className="text-center text-gray-400 py-8">
                    {selectedTestId ? 'Pilih ujian terlebih dahulu' : 'Tidak ada peserta'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Info */}
          {selectedTestId && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">ℹ️</span> Pilih salah satu peserta dari daftar di atas untuk melihat detail pertanyaan, jawaban, dan opsi tambah waktu ujian.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
