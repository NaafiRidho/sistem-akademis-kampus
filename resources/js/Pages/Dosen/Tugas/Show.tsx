import { useState, useEffect } from "react";
import { Head, router, Link } from "@inertiajs/react";
import DosenSidebar from "@/Components/Layout/DosenSidebar";
import Header from "@/Components/Layout/Header";

interface MataKuliah {
    id: number;
    nama_mk: string;
    kode_mk: string;
}

interface Tugas {
    id: number;
    judul: string;
    deskripsi: string;
    deadline: string;
    file_path?: string;
    mata_kuliah: MataKuliah;
}

interface Mahasiswa {
    id: number;
    nim: string;
    nama: string;
    prodi: string;
    kelas: string;
}

interface Pengumpulan {
    id: number;
    mahasiswa: Mahasiswa;
    file_path: string;
    waktu_pengumpulan: string;
    status: string;
    keterlambatan?: string;
    nilai?: number;
    catatan?: string;
}

interface Statistik {
    total_mahasiswa: number;
    jumlah_pengumpulan: number;
    belum_mengumpulkan: number;
    sudah_dinilai: number;
    belum_dinilai: number;
}

interface Props {
    tugas: Tugas;
    pengumpulan: Pengumpulan[];
    statistik: Statistik;
}

export default function Show({ tugas, pengumpulan, statistik }: Props) {
    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("darkMode");
            if (saved !== null) return saved === "true";
            return window.matchMedia("(prefers-color-scheme: dark)").matches;
        }
        return false;
    });
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        if (typeof window !== "undefined") {
            return window.innerWidth >= 1024;
        }
        return true;
    });

    const [showNilaiModal, setShowNilaiModal] = useState(false);
    const [selectedPengumpulan, setSelectedPengumpulan] = useState<Pengumpulan | null>(null);
    const [nilaiForm, setNilaiForm] = useState({ nilai: "", catatan: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
        localStorage.setItem("darkMode", String(darkMode));
    }, [darkMode]);

    const formatDate = (dateString: string) => {
        return dateString;
    };

    const handleBeriNilai = (item: Pengumpulan) => {
        setSelectedPengumpulan(item);
        setNilaiForm({
            nilai: item.nilai?.toString() || "",
            catatan: item.catatan || "",
        });
        setShowNilaiModal(true);
    };

    const handleSubmitNilai = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPengumpulan) return;

        setIsSubmitting(true);
        router.post(
            `/dosen/tugas/pengumpulan/${selectedPengumpulan.id}/nilai`,
            {
                nilai: parseFloat(nilaiForm.nilai),
                catatan: nilaiForm.catatan,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowNilaiModal(false);
                    setIsSubmitting(false);
                    setSelectedPengumpulan(null);
                },
                onError: () => {
                    setIsSubmitting(false);
                },
            }
        );
    };

    const getStatusBadge = (status: string) => {
        if (status === "Tepat Waktu") {
            return (
                <span className="px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                    Tepat Waktu
                </span>
            );
        } else {
            return (
                <span className="px-2 py-1 text-xs rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                    Terlambat
                </span>
            );
        }
    };

    return (
        <div className={darkMode ? "dark" : ""}>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
                <Head title={`Detail Tugas - ${tugas.judul}`} />

                <DosenSidebar
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    activeMenu="tugas"
                />

                <div
                    className={`p-4 transition-all duration-300 ${
                        sidebarOpen ? "lg:ml-64" : "lg:ml-0"
                    }`}
                >
                    <Header
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                        darkMode={darkMode}
                        setDarkMode={setDarkMode}
                        title="Detail Tugas"
                        subtitle="Lihat detail tugas dan pengumpulan mahasiswa"
                    />

                    {/* Back Button */}
                    <div className="mb-4">
                        <Link
                            href="/dosen/tugas"
                            className="inline-flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                            <svg
                                className="w-5 h-5 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                />
                            </svg>
                            Kembali ke Daftar Tugas
                        </Link>
                    </div>

                    {/* Tugas Info Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    {tugas.judul}
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                    {tugas.mata_kuliah.kode_mk} - {tugas.mata_kuliah.nama_mk}
                                </p>
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                    </svg>
                                    <span>Deadline: {formatDate(tugas.deadline)}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Link
                                    href={`/dosen/tugas/${tugas.id}/edit`}
                                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
                                >
                                    Edit
                                </Link>
                                {tugas.file_path && (
                                    <a
                                        href={`/dosen/tugas/${tugas.id}/download`}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                                    >
                                        Download File
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Deskripsi:
                            </h3>
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                {tugas.deskripsi}
                            </p>
                        </div>
                    </div>

                    {/* Statistik */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-4 text-white">
                            <p className="text-sm opacity-90 mb-1">Total Mahasiswa</p>
                            <p className="text-3xl font-bold">{statistik.total_mahasiswa}</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-4 text-white">
                            <p className="text-sm opacity-90 mb-1">Sudah Mengumpulkan</p>
                            <p className="text-3xl font-bold">{statistik.jumlah_pengumpulan}</p>
                        </div>
                        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-4 text-white">
                            <p className="text-sm opacity-90 mb-1">Belum Mengumpulkan</p>
                            <p className="text-3xl font-bold">{statistik.belum_mengumpulkan}</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-4 text-white">
                            <p className="text-sm opacity-90 mb-1">Sudah Dinilai</p>
                            <p className="text-3xl font-bold">{statistik.sudah_dinilai}</p>
                        </div>
                        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-4 text-white">
                            <p className="text-sm opacity-90 mb-1">Belum Dinilai</p>
                            <p className="text-3xl font-bold">{statistik.belum_dinilai}</p>
                        </div>
                    </div>

                    {/* Daftar Pengumpulan */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Daftar Pengumpulan ({pengumpulan.length})
                            </h3>
                        </div>

                        {pengumpulan.length === 0 ? (
                            <div className="p-12 text-center">
                                <svg
                                    className="mx-auto h-16 w-16 text-gray-400 mb-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    Belum Ada Pengumpulan
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Mahasiswa belum ada yang mengumpulkan tugas
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Mahasiswa
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Waktu Pengumpulan
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Nilai
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {pengumpulan.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {item.mahasiswa.nama}
                                                        </div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            {item.mahasiswa.nim} - {item.mahasiswa.kelas}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                                    {item.waktu_pengumpulan}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        {getStatusBadge(item.status)}
                                                        {item.keterlambatan && (
                                                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                                                ({item.keterlambatan})
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {item.nilai !== null && item.nilai !== undefined ? (
                                                        <div>
                                                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                                                                {item.nilai}
                                                            </span>
                                                            {item.catatan && (
                                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                    {item.catatan}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-500 dark:text-gray-400 italic">
                                                            Belum dinilai
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-2">
                                                        <a
                                                            href={`/dosen/tugas/pengumpulan/${item.id}/download`}
                                                            className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                                                        >
                                                            Download
                                                        </a>
                                                        <button
                                                            onClick={() => handleBeriNilai(item)}
                                                            className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                                                        >
                                                            {item.nilai ? "Edit Nilai" : "Beri Nilai"}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Nilai */}
            {showNilaiModal && selectedPengumpulan && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Beri Nilai
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {selectedPengumpulan.mahasiswa.nama} - {selectedPengumpulan.mahasiswa.nim}
                            </p>
                        </div>

                        <form onSubmit={handleSubmitNilai} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Nilai (0-100) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={nilaiForm.nilai}
                                    onChange={(e) =>
                                        setNilaiForm({ ...nilaiForm, nilai: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Catatan (Opsional)
                                </label>
                                <textarea
                                    value={nilaiForm.catatan}
                                    onChange={(e) =>
                                        setNilaiForm({ ...nilaiForm, catatan: e.target.value })
                                    }
                                    rows={3}
                                    placeholder="Berikan catatan atau feedback..."
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowNilaiModal(false)}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                                    disabled={isSubmitting}
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Menyimpan..." : "Simpan Nilai"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
