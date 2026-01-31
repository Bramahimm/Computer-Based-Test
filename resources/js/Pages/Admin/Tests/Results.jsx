import React, { useMemo, useState } from "react";
import { router, Head } from "@inertiajs/react";
import {
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Eye,
  Download,
  Filter,
  Calendar,
  User,
  BookOpen,
  Lock,
  Unlock,
  AlertCircle,
} from "lucide-react";

export default function Results({ testUsers = [], test }) {
  const [filterTest, setFilterTest] = useState(null);
  const [searchUser, setSearchUser] = useState("");
  const [sortBy, setSortBy] = useState("started_at");
  const [lockModal, setLockModal] = useState(null);
  const [lockReason, setLockReason] = useState("");

  // Group testUsers by test if not filtered
  const testsByGroup = useMemo(() => {
    const grouped = {};
    testUsers.forEach((testUser) => {
      const testId = testUser.test_id;
      if (!grouped[testId]) {
        grouped[testId] = {
          test: testUser.test,
          users: [],
        };
      }
      grouped[testId].users.push(testUser);
    });
    return grouped;
  }, [testUsers]);

  // Filter and calculate data
  const filteredData = useMemo(() => {
    let data = testUsers;

    // Filter by test if selected
    if (filterTest) {
      data = data.filter((tu) => tu.test_id === filterTest);
    }

    // Filter by user search
    if (searchUser) {
      data = data.filter(
        (tu) =>
          tu.user?.name?.toLowerCase().includes(searchUser.toLowerCase()) ||
          tu.user?.email?.toLowerCase().includes(searchUser.toLowerCase())
      );
    }

    // Sort data
    data = [...data].sort((a, b) => {
      if (sortBy === "started_at") {
        return new Date(b.started_at) - new Date(a.started_at);
      } else if (sortBy === "score_desc") {
        return (b.result?.total_score || 0) - (a.result?.total_score || 0);
      } else if (sortBy === "score_asc") {
        return (a.result?.total_score || 0) - (b.result?.total_score || 0);
      }
      return 0;
    });

    return data;
  }, [testUsers, filterTest, searchUser, sortBy]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = filteredData.length;
    const completed = filteredData.filter((tu) => tu.finished_at).length;
    const pending = total - completed;
    const avgScore =
      total > 0
        ? Math.round(
            filteredData.reduce((sum, tu) => sum + (tu.result?.total_score || 0), 0) / total
          )
        : 0;

    return { total, completed, pending, avgScore };
  }, [filteredData]);

  // Calculate answer stats for a test user
  const getAnswerStats = (testUser) => {
    const answers = testUser.answers || [];
    const correct = answers.filter((a) => a.is_correct).length;
    const incorrect = answers.filter((a) => !a.is_correct && a.answer_id).length;
    const totalQuestions = testUser.test?.questions_count || answers.length;
    const unanswered = totalQuestions - correct - incorrect;

    return { correct, incorrect, unanswered, total: answers.length };
  };

  // Format datetime
  const formatDateTime = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleString("id-ID", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Calculate duration taken
  const getDurationTaken = (testUser) => {
    if (!testUser.started_at || !testUser.finished_at) return "-";
    const start = new Date(testUser.started_at);
    const end = new Date(testUser.finished_at);
    const minutes = Math.floor((end - start) / 60000);
    return `${minutes} menit`;
  };

  // Calculate remaining time or time exceeded
  const getTimeStatus = (testUser) => {
    if (!testUser.started_at) return { text: "-", color: "gray" };

    const start = new Date(testUser.started_at);
    const now = testUser.finished_at ? new Date(testUser.finished_at) : new Date();
    const elapsedMinutes = Math.floor((now - start) / 60000);
    const remaining = (testUser.test?.duration || 0) - elapsedMinutes;

    if (remaining < 0) {
      return {
        text: `Terlampaui ${Math.abs(remaining)} menit`,
        color: "red",
      };
    } else if (remaining === 0) {
      return { text: "Selesai waktu", color: "orange" };
    } else {
      return {
        text: `Sisa ${remaining} menit`,
        color: remaining < 5 ? "orange" : "green",
      };
    }
  };

  // Handle lock action
  const handleLock = (testUser) => {
    setLockModal(testUser);
    setLockReason("");
  };

  // Submit lock
  const submitLock = () => {
    if (!lockReason.trim()) {
      alert("Alasan penguncian harus diisi!");
      return;
    }

    router.post(
      route("admin.test-users.lock", lockModal.id),
      { lock_reason: lockReason },
      {
        onSuccess: () => {
          setLockModal(null);
          setLockReason("");
        },
      }
    );
  };

  // Handle unlock
  const handleUnlock = (testUserid) => {
    if (confirm("Apakah Anda yakin ingin membuka kunci peserta ini?")) {
      router.post(route("admin.test-users.unlock", testUserid));
    }
  };

  return (
    <>
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Total Peserta
              </p>
              <p className="text-2xl font-black text-blue-900 mt-1">{stats.total}</p>
            </div>
            <User className="w-10 h-10 text-blue-300" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-green-600 uppercase tracking-wider">
                Selesai
              </p>
              <p className="text-2xl font-black text-green-900 mt-1">{stats.completed}</p>
            </div>
            <CheckCircle2 className="w-10 h-10 text-green-300" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-yellow-600 uppercase tracking-wider">
                Pending
              </p>
              <p className="text-2xl font-black text-yellow-900 mt-1">{stats.pending}</p>
            </div>
            <Clock className="w-10 h-10 text-yellow-300" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-purple-600 uppercase tracking-wider">
                Rata-rata Nilai
              </p>
              <p className="text-2xl font-black text-purple-900 mt-1">{stats.avgScore}</p>
            </div>
            <BookOpen className="w-10 h-10 text-purple-300" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Test Filter */}
          <div className="flex-1">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-2">
              <Filter className="w-3 h-3 inline mr-1" />
              Filter Ujian
            </label>
            <select
              value={filterTest || ""}
              onChange={(e) => setFilterTest(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Semua Ujian</option>
              {Object.entries(testsByGroup).map(([testId, group]) => (
                <option key={testId} value={testId}>
                  {group.test?.title} ({group.users.length} peserta)
                </option>
              ))}
            </select>
          </div>

          {/* User Search */}
          <div className="flex-1">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-2">
              <User className="w-3 h-3 inline mr-1" />
              Cari Peserta
            </label>
            <input
              type="text"
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              placeholder="Nama atau email peserta..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Sort */}
          <div className="flex-1">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-2">
              Urutkan
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="started_at">Terbaru Mulai</option>
              <option value="score_desc">Nilai Tertinggi</option>
              <option value="score_asc">Nilai Terendah</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
                <th className="px-4 py-3 text-left font-bold text-gray-700 uppercase tracking-wider">
                  #
                </th>
                <th className="px-4 py-3 text-left font-bold text-gray-700 uppercase tracking-wider">
                  Mulai
                </th>
                <th className="px-4 py-3 text-left font-bold text-gray-700 uppercase tracking-wider">
                  Waktu
                </th>
                <th className="px-4 py-3 text-left font-bold text-gray-700 uppercase tracking-wider">
                  Nama
                </th>
                <th className="px-4 py-3 text-center font-bold text-gray-700 uppercase tracking-wider">
                  Nilai
                </th>
                <th className="px-4 py-3 text-center font-bold text-gray-700 uppercase tracking-wider">
                  Benar
                </th>
                <th className="px-4 py-3 text-center font-bold text-gray-700 uppercase tracking-wider">
                  Salah
                </th>
                <th className="px-4 py-3 text-center font-bold text-gray-700 uppercase tracking-wider">
                  Belum Dijawab
                </th>
                <th className="px-4 py-3 text-center font-bold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-center font-bold text-gray-700 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan="10" className="text-center py-12 text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <HelpCircle className="w-12 h-12 opacity-20" />
                      Belum ada hasil ujian
                    </div>
                  </td>
                </tr>
              )}

              {filteredData.map((testUser, index) => {
                const stats = getAnswerStats(testUser);
                const timeStatus = getTimeStatus(testUser);
                const statusColor =
                  timeStatus.color === "red"
                    ? "bg-red-100 text-red-700"
                    : timeStatus.color === "orange"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700";

                return (
                  <tr
                    key={testUser.id}
                    className={`border-b border-gray-100 hover:bg-blue-50 transition ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-4 py-3 font-bold text-gray-600">{index + 1}</td>
                    <td className="px-4 py-3 text-gray-600 font-mono">
                      {formatDateTime(testUser.started_at)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {getDurationTaken(testUser)}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-bold text-gray-900">
                          {testUser.user?.name || "-"}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {testUser.user?.email || "-"}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="font-black text-lg text-blue-600">
                        {testUser.result?.total_score || 0}
                      </div>
                      <div className="text-xs text-gray-500">
                        {testUser.test?.questions_count || 0} soal
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        {stats.correct}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full font-bold">
                        <XCircle className="w-3 h-3" />
                        {stats.incorrect}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex items-center gap-1 bg-gray-200 text-gray-700 px-3 py-1 rounded-full font-bold">
                        <HelpCircle className="w-3 h-3" />
                        {stats.unanswered}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${statusColor}`}>
                        {testUser.finished_at ? "Selesai" : "Berlangsung"}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        {timeStatus.text}
                      </div>
                      {testUser.is_locked && (
                        <div className="mt-2 inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">
                          <Lock className="w-3 h-3" />
                          Dikunci
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() =>
                            router.visit(
                              route("admin.tests.testUser.show", testUser.id)
                            )
                          }
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition font-bold text-xs"
                        >
                          <Eye className="w-3 h-3" />
                          Detail
                        </button>
                        {testUser.is_locked ? (
                          <button
                            onClick={() => handleUnlock(testUser.id)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition font-bold text-xs"
                          >
                            <Unlock className="w-3 h-3" />
                            Buka
                          </button>
                        ) : (
                          <button
                            onClick={() => handleLock(testUser)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition font-bold text-xs"
                          >
                            <Lock className="w-3 h-3" />
                            Kunci
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-6 text-center text-xs text-gray-500">
        <p>Menampilkan {filteredData.length} dari {testUsers.length} hasil ujian</p>
      </div>

      {/* Lock Modal */}
      {lockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-bold text-gray-900">Kunci Peserta</h3>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Anda akan mengunci peserta <span className="font-bold">{lockModal.user?.name}</span> dari ujian ini.
              Peserta tidak akan bisa melanjutkan mengerjakan soal.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Alasan Penguncian
              </label>
              <textarea
                value={lockReason}
                onChange={(e) => setLockReason(e.target.value)}
                placeholder="Contoh: Curang, Kehabisan waktu, Gangguan teknis, dll"
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setLockModal(null)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition text-sm"
              >
                Batal
              </button>
              <button
                onClick={submitLock}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition text-sm"
              >
                Kunci Peserta
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
