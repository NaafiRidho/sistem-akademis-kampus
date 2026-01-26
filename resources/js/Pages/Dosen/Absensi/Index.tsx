import { useState, useEffect } from "react";
import { Head, router } from "@inertiajs/react";
import DosenSidebar from "@/Components/Layout/DosenSidebar";
import Header from "@/Components/Layout/Header";

interface MataKuliah {
    id: number;
    nama_mk: string;
    kode: string;
}

interface Kelas {
    id: number;
    nama: string;
    nama_kelas?: string;
}

interface Mahasiswa {
    id: number;
    nim: string;
    nama: string;
    prodi: string;
}

interface Jadwal {
    id: number;
    mata_kuliah: MataKuliah;
    kelas: Kelas;
    hari: string;
    jam_mulai: string;
}

interface Absensi {
    id: number;
    tanggal: string;
    status: string;
    keterangan: string | null;
    mahasiswa: Mahasiswa;
    jadwal: Jadwal;
}

interface PaginatedAbsensi {
    data: Absensi[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    absensi: PaginatedAbsensi;
    mataKuliahList: any[];
    kelasList: any[];
    filters: {
        mata_kuliah_id?: number;
        kelas_id?: number;
        status?: string;
        tanggal?: string;
        search?: string;
    };
}

export default function AbsensiIndex({
    absensi,
    mataKuliahList,
    kelasList,
    filters,
}: Props) {
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
        filters.mata_kuliah_id?.toString() || "",
    );
    const [selectedKelas, setSelectedKelas] = useState(
        filters.kelas_id?.toString() || "",
    );
    const [selectedStatus, setSelectedStatus] = useState(filters.status || "");
    const [selectedTanggal, setSelectedTanggal] = useState(
        filters.tanggal || "",
    );

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
        localStorage.setItem("darkMode", String(darkMode));
    }, [darkMode]);

    const handleFilter = () => {
        router.get(
            "/dosen/absensi",
            {
                search: searchTerm,
                mata_kuliah_id: selectedMataKuliah,
                kelas_id: selectedKelas,
                status: selectedStatus,
                tanggal: selectedTanggal,
            },
            {
                preserveState: true,
            },
        );
    };

    const handleReset = () => {
        setSearchTerm("");
        setSelectedMataKuliah("");
        setSelectedKelas("");
        setSelectedStatus("");
        setSelectedTanggal("");
        router.get("/dosen/absensi");
    };

    const getStatusBadge = (status: string) => {
        const badges: Record<string, string> = {
            Hadir: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
            Izin: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
            Sakit: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
            Alpa: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
        };
        return badges[status] || "bg-gray-100 text-gray-700";
    };

    return (
        <div className={darkMode ? "dark" : ""}>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
                <Head title="Kelola Absensi" />

                <DosenSidebar
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    activeMenu="absensi"
                />

                <div
                    className={`p-4 transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : "lg:ml-0"}`}
                >
                    <Header
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                        darkMode={darkMode}
                        setDarkMode={setDarkMode}
                        title="Kelola Absensi"
                        subtitle="Kelola kehadiran mahasiswa untuk mata kuliah yang Anda ajar"
                    />

                    <div className="mt-6 max-w-7xl mx-auto">
                        {/* Header dengan Info Card */}
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                📋 Kelola Absensi
                            </h1>

                            {/* Quick Action Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div
                                    onClick={() =>
                                        router.get("/dosen/absensi/create")
                                    }
                                    className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl p-6 text-white cursor-pointer transform hover:scale-105 transition-all shadow-lg"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-bold mb-2">
                                                Input Absensi Baru
                                            </h3>
                                            <p className="text-blue-100 text-sm">
                                                Rekam kehadiran mahasiswa untuk
                                                pertemuan hari ini
                                            </p>
                                        </div>
                                        <svg
                                            className="w-12 h-12 opacity-80"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                                            />
                                        </svg>
                                    </div>
                                </div>

                                <div
                                    onClick={() =>
                                        router.get("/dosen/absensi/rekap")
                                    }
                                    className="bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-xl p-6 text-white cursor-pointer transform hover:scale-105 transition-all shadow-lg"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-bold mb-2">
                                                Lihat Rekap Absensi
                                            </h3>
                                            <p className="text-purple-100 text-sm">
                                                Statistik dan ringkasan
                                                kehadiran mahasiswa
                                            </p>
                                        </div>
                                        <svg
                                            className="w-12 h-12 opacity-80"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Filter Section - Simplified */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 mb-6">
                            <div className="flex items-center gap-2 mb-4">
                                <svg
                                    className="w-5 h-5 text-gray-600 dark:text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                                    />
                                </svg>
                                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                                    Filter & Pencarian
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Search */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        🔍 Cari Mahasiswa
                                    </label>
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                        onKeyPress={(e) =>
                                            e.key === "Enter" && handleFilter()
                                        }
                                        placeholder="Ketik NIM atau Nama..."
                                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white placeholder-gray-400"
                                    />
                                </div>

                                {/* Tanggal */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        📅 Tanggal
                                    </label>
                                    <input
                                        type="date"
                                        value={selectedTanggal}
                                        onChange={(e) =>
                                            setSelectedTanggal(e.target.value)
                                        }
                                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        📊 Status Kehadiran
                                    </label>
                                    <select
                                        value={selectedStatus}
                                        onChange={(e) =>
                                            setSelectedStatus(e.target.value)
                                        }
                                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="">Semua Status</option>
                                        <option value="Hadir">✅ Hadir</option>
                                        <option value="Izin">📝 Izin</option>
                                        <option value="Sakit">🏥 Sakit</option>
                                        <option value="Alpa">❌ Alpa</option>
                                    </select>
                                </div>
                            </div>

                            {/* Advanced Filters - Collapsible */}
                            <details className="mt-4">
                                <summary className="cursor-pointer text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                                    ⚙️ Filter Lanjutan (Mata Kuliah & Kelas)
                                </summary>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            📚 Mata Kuliah
                                        </label>
                                        <select
                                            value={selectedMataKuliah}
                                            onChange={(e) =>
                                                setSelectedMataKuliah(
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="">
                                                Semua Mata Kuliah
                                            </option>
                                            {mataKuliahList.map((mk) => (
                                                <option
                                                    key={mk.id}
                                                    value={mk.id}
                                                >
                                                    {mk.kode_mk} - {mk.nama_mk}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            🏫 Kelas
                                        </label>
                                        <select
                                            value={selectedKelas}
                                            onChange={(e) =>
                                                setSelectedKelas(e.target.value)
                                            }
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="">
                                                Semua Kelas
                                            </option>
                                            {kelasList.map((kelas) => (
                                                <option
                                                    key={kelas.id}
                                                    value={kelas.id}
                                                >
                                                    {kelas.nama_kelas}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </details>

                            <div className="flex gap-3 mt-4">
                                <button
                                    onClick={handleFilter}
                                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors shadow-sm flex items-center gap-2"
                                >
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        />
                                    </svg>
                                    Cari
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition-colors"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>

                        {/* Riwayat Absensi Table */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
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
                                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                        />
                                    </svg>
                                    Riwayat Absensi
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Total: {absensi.total} data absensi
                                </p>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full bg-white dark:bg-gray-800">
                                    <thead className="bg-gray-50 dark:bg-gray-700 border-b-2 border-gray-200 dark:border-gray-600">
                                        <tr>
                                            <th className="px-5 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                                                <div className="flex items-center gap-2">
                                                    📅 <span>Tanggal</span>
                                                </div>
                                            </th>
                                            <th className="px-5 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                                                <div className="flex items-center gap-2">
                                                    👤 <span>Mahasiswa</span>
                                                </div>
                                            </th>
                                            <th className="px-5 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                                                <div className="flex items-center gap-2">
                                                    📚 <span>Mata Kuliah</span>
                                                </div>
                                            </th>
                                            <th className="px-5 py-4 text-center text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                                                <div className="flex items-center justify-center gap-2">
                                                    ✓ <span>Status</span>
                                                </div>
                                            </th>
                                            <th className="px-5 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                                                <div className="flex items-center gap-2">
                                                    📝 <span>Keterangan</span>
                                                </div>
                                            </th>
                                            <th className="px-5 py-4 text-center text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                                                <div className="flex items-center justify-center gap-2">
                                                    ⚙️ <span>Aksi</span>
                                                </div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {absensi.data.length > 0 ? (
                                            absensi.data.map((item) => (
                                                <tr
                                                    key={item.id}
                                                    className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent dark:hover:from-gray-700/40 dark:hover:to-transparent transition-all duration-200 group"
                                                >
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-2.5 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                                                                <svg
                                                                    className="w-5 h-5 text-blue-600 dark:text-blue-400"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={
                                                                            2
                                                                        }
                                                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                                    />
                                                                </svg>
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-bold text-gray-900 dark:text-white">
                                                                    {new Date(
                                                                        item.tanggal,
                                                                    ).toLocaleDateString(
                                                                        "id-ID",
                                                                        {
                                                                            day: "numeric",
                                                                            month: "short",
                                                                            year: "numeric",
                                                                        },
                                                                    )}
                                                                </div>
                                                                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                                                    {new Date(
                                                                        item.tanggal,
                                                                    ).toLocaleDateString(
                                                                        "id-ID",
                                                                        {
                                                                            weekday:
                                                                                "long",
                                                                        },
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full w-10 h-10 flex items-center justify-center text-purple-700 dark:text-purple-400 font-bold text-sm group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                                                                {item.mahasiswa.nama
                                                                    .split(" ")
                                                                    .map(
                                                                        (n) =>
                                                                            n[0],
                                                                    )
                                                                    .slice(0, 2)
                                                                    .join("")
                                                                    .toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-bold text-gray-900 dark:text-white">
                                                                    {
                                                                        item
                                                                            .mahasiswa
                                                                            .nama
                                                                    }
                                                                </div>
                                                                <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                                                    {
                                                                        item
                                                                            .mahasiswa
                                                                            .nim
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="bg-green-100 dark:bg-green-900/30 rounded-lg px-2.5 py-1.5 group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                                                                <span className="text-xs font-bold text-green-700 dark:text-green-400">
                                                                    {
                                                                        item
                                                                            .jadwal
                                                                            .mata_kuliah
                                                                            .kode
                                                                    }
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                                                    {
                                                                        item
                                                                            .jadwal
                                                                            .mata_kuliah
                                                                            .nama_mk
                                                                    }
                                                                </div>
                                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                    Kelas{" "}
                                                                    {
                                                                        item
                                                                            .jadwal
                                                                            .kelas
                                                                            .nama
                                                                    }{" "}
                                                                    •{" "}
                                                                    {
                                                                        item
                                                                            .jadwal
                                                                            .hari
                                                                    }
                                                                    ,{" "}
                                                                    {
                                                                        item
                                                                            .jadwal
                                                                            .jam_mulai
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4 text-center">
                                                        <span
                                                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold ${getStatusBadge(item.status)}`}
                                                        >
                                                            <span className="text-base">
                                                                {item.status ===
                                                                    "Hadir" &&
                                                                    "✅"}
                                                                {item.status ===
                                                                    "Izin" &&
                                                                    "📝"}
                                                                {item.status ===
                                                                    "Sakit" &&
                                                                    "🏥"}
                                                                {item.status ===
                                                                    "Alpa" &&
                                                                    "❌"}
                                                            </span>
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="text-sm text-gray-600 dark:text-gray-400 max-w-xs">
                                                            {item.keterangan ? (
                                                                <span className="line-clamp-2">
                                                                    {
                                                                        item.keterangan
                                                                    }
                                                                </span>
                                                            ) : (
                                                                <span className="text-gray-400 dark:text-gray-500 italic text-xs">
                                                                    Tidak ada
                                                                    keterangan
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() =>
                                                                    router.get(
                                                                        `/dosen/absensi/${item.id}/edit`,
                                                                    )
                                                                }
                                                                className="p-2.5 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-all hover:scale-110"
                                                                title="Edit Absensi"
                                                            >
                                                                <svg
                                                                    className="w-5 h-5"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={
                                                                            2
                                                                        }
                                                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                                    />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    if (
                                                                        confirm(
                                                                            `Hapus absensi ${item.mahasiswa.nama} pada ${new Date(item.tanggal).toLocaleDateString("id-ID")}?`,
                                                                        )
                                                                    ) {
                                                                        router.delete(
                                                                            `/dosen/absensi/${item.id}`,
                                                                        );
                                                                    }
                                                                }}
                                                                className="p-2.5 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-all hover:scale-110"
                                                                title="Hapus Absensi"
                                                            >
                                                                <svg
                                                                    className="w-5 h-5"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={
                                                                            2
                                                                        }
                                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                                    />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={6}
                                                    className="px-6 py-16 text-center"
                                                >
                                                    <div className="flex flex-col items-center justify-center">
                                                        <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-6 mb-4">
                                                            <svg
                                                                className="w-16 h-16 text-gray-400 dark:text-gray-500"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={
                                                                        2
                                                                    }
                                                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                                                                />
                                                            </svg>
                                                        </div>
                                                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                            Belum Ada Data
                                                            Absensi
                                                        </h3>
                                                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                                                            {searchTerm ||
                                                            selectedStatus ||
                                                            selectedTanggal ||
                                                            selectedMataKuliah ||
                                                            selectedKelas
                                                                ? "Tidak ada data yang sesuai dengan filter"
                                                                : "Mulai input absensi mahasiswa untuk kelas Anda"}
                                                        </p>
                                                        <button
                                                            onClick={() =>
                                                                router.get(
                                                                    "/dosen/absensi/create",
                                                                )
                                                            }
                                                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors shadow-md"
                                                        >
                                                            Input Absensi
                                                            Sekarang
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {absensi.last_page > 1 && (
                                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            Menampilkan {absensi.data.length}{" "}
                                            dari {absensi.total} data
                                        </p>
                                        <div className="flex gap-2">
                                            {Array.from(
                                                { length: absensi.last_page },
                                                (_, i) => i + 1,
                                            ).map((page) => (
                                                <button
                                                    key={page}
                                                    onClick={() =>
                                                        router.get(
                                                            `/dosen/absensi?page=${page}`,
                                                            filters,
                                                            {
                                                                preserveState: true,
                                                            },
                                                        )
                                                    }
                                                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                                                        page ===
                                                        absensi.current_page
                                                            ? "bg-blue-600 text-white"
                                                            : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
