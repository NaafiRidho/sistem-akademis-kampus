import { useState, useEffect } from "react";
import { Head, router } from "@inertiajs/react";
import DosenSidebar from "@/Components/Layout/DosenSidebar";
import Header from "@/Components/Layout/Header";

interface MahasiswaSummary {
    id: number;
    nim: string;
    nama: string;
    kelas: string;
    prodi: string;
    total: number;
    hadir: number;
    izin: number;
    sakit: number;
    alpa: number;
    persentase: number;
}

interface Props {
    mahasiswaList: MahasiswaSummary[];
    kelasList: any[];
    jadwalList: any[];
    filters: {
        jadwal_id?: number;
        kelas_id?: number;
        bulan?: string;
    };
}

export default function AbsensiRekap({
    mahasiswaList,
    kelasList,
    jadwalList,
    filters,
}: Props) {
    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('darkMode');
            if (saved !== null) return saved === 'true';
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    });
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 1024;
        }
        return true;
    });
    const [selectedJadwal, setSelectedJadwal] = useState(
        filters.jadwal_id?.toString() || "",
    );
    const [selectedKelas, setSelectedKelas] = useState(
        filters.kelas_id?.toString() || "",
    );
    const [selectedBulan, setSelectedBulan] = useState(
        filters.bulan || new Date().toISOString().slice(0, 7),
    );

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('darkMode', String(darkMode));
    }, [darkMode]);

    const handleFilter = () => {
        router.get(
            "/dosen/absensi/rekap",
            {
                jadwal_id: selectedJadwal,
                kelas_id: selectedKelas,
                bulan: selectedBulan,
            },
            {
                preserveState: true,
            },
        );
    };

    const getPersentaseColor = (persentase: number) => {
        if (persentase >= 80) return "text-green-600 dark:text-green-400";
        if (persentase >= 60) return "text-yellow-600 dark:text-yellow-400";
        return "text-red-600 dark:text-red-400";
    };

    return (
        <div className={darkMode ? "dark" : ""}>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
                <Head title="Rekap Absensi" />

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
                        title="Rekap Absensi"
                        subtitle="Ringkasan kehadiran mahasiswa per mata kuliah"
                    />

                    <div className="mt-6 max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="mb-6">
                            <button
                                onClick={() => router.get('/dosen/absensi')}
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4 flex items-center gap-2 text-sm font-medium"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Kembali ke Daftar Absensi
                            </button>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                📊 Rekap Absensi Mahasiswa
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Statistik kehadiran mahasiswa per kelas dan periode
                            </p>
                        </div>

                        {/* Filters */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
                            <div className="flex items-center gap-2 mb-4">
                                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                                    Filter Periode & Kelas
                                </h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        📚 Mata Kuliah
                                    </label>
                                    <select
                                        value={selectedJadwal}
                                        onChange={(e) =>
                                            setSelectedJadwal(e.target.value)
                                        }
                                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="">Semua Mata Kuliah</option>
                                        {jadwalList.map((jadwal) => (
                                            <option
                                                key={jadwal.id}
                                                value={jadwal.id}
                                            >
                                                {jadwal.label}
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
                                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="">Semua Kelas</option>
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

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        📅 Periode Bulan
                                    </label>
                                    <input
                                        type="month"
                                        value={selectedBulan}
                                        onChange={(e) =>
                                            setSelectedBulan(e.target.value)
                                        }
                                        max={new Date().toISOString().slice(0, 7)}
                                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-4">
                                <button
                                    onClick={handleFilter}
                                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors shadow-sm flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    Tampilkan Rekap
                                </button>
                            </div>
                        </div>

                        {/* Rekap Table */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                            Statistik Kehadiran
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            Periode: {new Date(selectedBulan + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-lg text-sm font-bold">
                                        {mahasiswaList.length} Mahasiswa
                                    </span>
                                </div>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full bg-white dark:bg-gray-800">
                                    <thead className="bg-gray-50 dark:bg-gray-700 border-b-2 border-gray-200 dark:border-gray-600">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider w-16">No</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">👤 Mahasiswa</th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider w-24">✅ Hadir</th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider w-24">📝 Izin</th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider w-24">🏥 Sakit</th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider w-24">❌ Alpa</th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider w-24">📊 Total</th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider w-32">🎯 Kehadiran</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {mahasiswaList.length > 0 ? (
                                            mahasiswaList.map((mhs, index) => (
                                                <tr
                                                    key={mhs.id}
                                                    className="hover:bg-blue-50 dark:hover:bg-gray-700/30 transition-colors"
                                                >
                                                    <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        {index + 1}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                                            {mhs.nama}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                            {mhs.nim} • {mhs.kelas}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-center">
                                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20">
                                                            <span className="text-lg font-bold text-green-700 dark:text-green-400">
                                                                {mhs.hadir}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-center">
                                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                                                            <span className="text-lg font-bold text-blue-700 dark:text-blue-400">
                                                                {mhs.izin}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-center">
                                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/20">
                                                            <span className="text-lg font-bold text-yellow-700 dark:text-yellow-400">
                                                                {mhs.sakit}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-center">
                                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/20">
                                                            <span className="text-lg font-bold text-red-700 dark:text-red-400">
                                                                {mhs.alpa}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-center">
                                                        <span className="text-base font-bold text-gray-900 dark:text-white">
                                                            {mhs.total}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex flex-col items-center gap-1">
                                                            <span className={`text-xl font-bold ${getPersentaseColor(mhs.persentase)}`}>
                                                                {mhs.persentase}%
                                                            </span>
                                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full transition-all ${
                                                                        mhs.persentase >= 80 ? 'bg-green-500' :
                                                                        mhs.persentase >= 60 ? 'bg-yellow-500' :
                                                                        'bg-red-500'
                                                                    }`}
                                                                    style={{ width: `${mhs.persentase}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={8}
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
                                                                    strokeWidth={2}
                                                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                                                />
                                                            </svg>
                                                        </div>
                                                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                            Tidak Ada Data Rekap
                                                        </h3>
                                                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                                                            Belum ada data absensi untuk periode yang dipilih
                                                        </p>
                                                        <button
                                                            onClick={() => router.get('/dosen/absensi/create')}
                                                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors shadow-md"
                                                        >
                                                            Input Absensi
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
