import { useState, useEffect } from "react";
import { Head, router, Link } from "@inertiajs/react";
import DosenSidebar from "@/Components/Layout/DosenSidebar";
import Header from "@/Components/Layout/Header";

interface MataKuliah {
    id: number;
    nama_mk: string;
    kode_mk: string;
    sks: number;
    kelas: string[];
}

interface Tugas {
    id: number;
    judul: string;
    deskripsi: string;
    deadline: string;
    mata_kuliah: {
        id: number;
        nama_mk: string;
        kode_mk: string;
    };
    jumlah_pengumpulan: number;
    total_mahasiswa: number;
    belum_mengumpulkan: number;
    status_deadline: 'normal' | 'urgent' | 'expired';
    file_path?: string;
}

interface PaginatedTugas {
    data: Tugas[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    tugas: PaginatedTugas;
    mataKuliahList: MataKuliah[];
    filters: {
        mata_kuliah_id?: string;
        search?: string;
    };
}

export default function Index({ tugas, mataKuliahList, filters }: Props) {
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

    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [selectedMataKuliah, setSelectedMataKuliah] = useState(
        filters.mata_kuliah_id || ""
    );
    const [deleteId, setDeleteId] = useState<number | null>(null);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
        localStorage.setItem("darkMode", String(darkMode));
    }, [darkMode]);

    const handleSearch = () => {
        router.get(
            "/dosen/tugas",
            {
                search: searchTerm,
                mata_kuliah_id: selectedMataKuliah,
            },
            { preserveState: true }
        );
    };

    const handleReset = () => {
        setSearchTerm("");
        setSelectedMataKuliah("");
        router.get("/dosen/tugas");
    };

    const handleDelete = (id: number) => {
        if (confirm("Apakah Anda yakin ingin menghapus tugas ini?")) {
            router.delete(`/dosen/tugas/${id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setDeleteId(null);
                },
            });
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "normal":
                return (
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                        Normal
                    </span>
                );
            case "urgent":
                return (
                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                        Segera
                    </span>
                );
            case "expired":
                return (
                    <span className="px-2 py-1 text-xs rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                        Expired
                    </span>
                );
            default:
                return null;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className={darkMode ? "dark" : ""}>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
                <Head title="Kelola Tugas" />

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
                        title="Kelola Tugas"
                        subtitle="Kelola dan pantau tugas mahasiswa"
                    />

                    {/* Filter Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Cari Tugas
                                </label>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    placeholder="Cari berdasarkan judul..."
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    onKeyPress={(e) => {
                                        if (e.key === "Enter") handleSearch();
                                    }}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Filter Mata Kuliah
                                </label>
                                <select
                                    value={selectedMataKuliah}
                                    onChange={(e) =>
                                        setSelectedMataKuliah(e.target.value)
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Semua Mata Kuliah</option>
                                    {mataKuliahList.map((mk) => (
                                        <option key={mk.id} value={mk.id}>
                                            {mk.kode_mk} - {mk.nama_mk}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-end gap-2">
                                <button
                                    onClick={handleSearch}
                                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                >
                                    Filter
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="mb-6 flex justify-between items-center">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Total: {tugas.total} tugas
                        </div>
                        <Link
                            href="/dosen/tugas/create"
                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg"
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
                                    d="M12 4v16m8-8H4"
                                />
                            </svg>
                            Tambah Tugas
                        </Link>
                    </div>

                    {/* Tugas List */}
                    {tugas.data.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
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
                                Belum Ada Tugas
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                Mulai dengan membuat tugas pertama Anda
                            </p>
                            <Link
                                href="/dosen/tugas/create"
                                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
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
                                        d="M12 4v16m8-8H4"
                                    />
                                </svg>
                                Tambah Tugas
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {tugas.data.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow"
                                >
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                                        {item.judul}
                                                    </h3>
                                                    {getStatusBadge(
                                                        item.status_deadline
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                    {item.mata_kuliah.kode_mk} -{" "}
                                                    {item.mata_kuliah.nama_mk}
                                                </p>
                                                <p className="text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
                                                    {item.deskripsi}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        <div className="grid grid-cols-4 gap-4 mb-4">
                                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                                                <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">
                                                    Total Mahasiswa
                                                </p>
                                                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                                                    {item.total_mahasiswa}
                                                </p>
                                            </div>
                                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                                                <p className="text-xs text-green-600 dark:text-green-400 mb-1">
                                                    Sudah Mengumpulkan
                                                </p>
                                                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                                                    {item.jumlah_pengumpulan}
                                                </p>
                                            </div>
                                            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
                                                <p className="text-xs text-orange-600 dark:text-orange-400 mb-1">
                                                    Belum Mengumpulkan
                                                </p>
                                                <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                                                    {item.belum_mengumpulkan}
                                                </p>
                                            </div>
                                            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                                                <p className="text-xs text-purple-600 dark:text-purple-400 mb-1">
                                                    Progress
                                                </p>
                                                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                                                    {item.total_mahasiswa > 0
                                                        ? Math.round(
                                                              (item.jumlah_pengumpulan /
                                                                  item.total_mahasiswa) *
                                                                  100
                                                          )
                                                        : 0}
                                                    %
                                                </p>
                                            </div>
                                        </div>

                                        {/* Deadline */}
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
                                            <span>
                                                Deadline:{" "}
                                                {formatDate(item.deadline)}
                                            </span>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                                            <Link
                                                href={`/dosen/tugas/${item.id}`}
                                                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-center transition-colors"
                                            >
                                                Lihat Detail
                                            </Link>
                                            <Link
                                                href={`/dosen/tugas/${item.id}/edit`}
                                                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
                                            >
                                                Edit
                                            </Link>
                                            {item.file_path && (
                                                <a
                                                    href={`/dosen/tugas/${item.id}/download`}
                                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                                                >
                                                    Download
                                                </a>
                                            )}
                                            <button
                                                onClick={() =>
                                                    handleDelete(item.id)
                                                }
                                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {tugas.last_page > 1 && (
                        <div className="mt-6 flex justify-center">
                            <nav className="flex items-center gap-2">
                                {Array.from(
                                    { length: tugas.last_page },
                                    (_, i) => i + 1
                                ).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() =>
                                            router.get(
                                                `/dosen/tugas?page=${page}`,
                                                {
                                                    search: searchTerm,
                                                    mata_kuliah_id:
                                                        selectedMataKuliah,
                                                }
                                            )
                                        }
                                        className={`px-4 py-2 rounded-lg ${
                                            page === tugas.current_page
                                                ? "bg-blue-600 text-white"
                                                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
