import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import DosenSidebar from '@/Components/Layout/DosenSidebar';
import Header from '@/Components/Layout/Header';

interface NilaiSummary {
    mahasiswa_id: number;
    nim: string;
    nama: string;
    kelas: string;
    tugas_avg: number;
    uts_avg: number;
    uas_avg: number;
    nilai_akhir_avg: number;
    grade_terbanyak: string;
    jumlah_mk: number;
}

interface Props {
    rekapNilai: NilaiSummary[];
    mataKuliahList: any[];
    kelasList: any[];
    filters: {
        mata_kuliah_id?: number;
        kelas_id?: number;
        semester?: string;
        tahun_ajaran?: string;
    };
}

export default function NilaiRekap({ rekapNilai, mataKuliahList, kelasList, filters }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [selectedMataKuliah, setSelectedMataKuliah] = useState(filters.mata_kuliah_id?.toString() || '');
    const [selectedKelas, setSelectedKelas] = useState(filters.kelas_id?.toString() || '');
    const [selectedSemester, setSelectedSemester] = useState(filters.semester || '');
    const [selectedTahunAjaran, setSelectedTahunAjaran] = useState(filters.tahun_ajaran || '');

    useEffect(() => {
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        setDarkMode(savedDarkMode);
    }, []);

    const handleFilter = () => {
        router.get('/dosen/nilai/rekap', {
            mata_kuliah_id: selectedMataKuliah,
            kelas_id: selectedKelas,
            semester: selectedSemester,
            tahun_ajaran: selectedTahunAjaran,
        }, {
            preserveState: true,
        });
    };

    const handleReset = () => {
        setSelectedMataKuliah('');
        setSelectedKelas('');
        setSelectedSemester('');
        setSelectedTahunAjaran('');
        router.get('/dosen/nilai/rekap');
    };

    const getGradeBadge = (grade: string) => {
        const badges: Record<string, string> = {
            'A': 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
            'B': 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
            'C': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
            'D': 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
            'E': 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
        };
        return badges[grade] || 'bg-gray-100 text-gray-700';
    };

    const getPerformanceColor = (nilai: number) => {
        if (nilai >= 85) return 'text-green-600 dark:text-green-400';
        if (nilai >= 70) return 'text-blue-600 dark:text-blue-400';
        if (nilai >= 60) return 'text-yellow-600 dark:text-yellow-400';
        if (nilai >= 50) return 'text-orange-600 dark:text-orange-400';
        return 'text-red-600 dark:text-red-400';
    };

    // Calculate statistics
    const totalMahasiswa = rekapNilai.length;
    const avgNilaiAkhir = totalMahasiswa > 0
        ? rekapNilai.reduce((sum, item) => sum + item.nilai_akhir_avg, 0) / totalMahasiswa
        : 0;
    const gradeDistribution = rekapNilai.reduce((acc, item) => {
        acc[item.grade_terbanyak] = (acc[item.grade_terbanyak] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className={darkMode ? 'dark' : ''}>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
                <Head title="Rekap Nilai" />

                <DosenSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeMenu="nilai" />

                <div className={`p-4 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
                    <Header
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                        darkMode={darkMode}
                        setDarkMode={setDarkMode}
                        title="Rekap Nilai"
                        subtitle="Ringkasan dan statistik nilai mahasiswa"
                    />

                    <div className="mt-6">
                        {/* Header */}
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Rekap Nilai Mahasiswa
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Ringkasan dan statistik nilai mahasiswa
                            </p>
                        </div>

                        {/* Statistics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Total Mahasiswa</p>
                                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                            {totalMahasiswa}
                                        </p>
                                    </div>
                                    <div className="bg-blue-100 dark:bg-blue-900/20 p-4 rounded-full">
                                        <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Rata-rata Nilai</p>
                                        <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                                            {avgNilaiAkhir.toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="bg-purple-100 dark:bg-purple-900/20 p-4 rounded-full">
                                        <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">Distribusi Grade</p>
                                <div className="space-y-2">
                                    {['A', 'B', 'C', 'D', 'E'].map(grade => (
                                        <div key={grade} className="flex items-center justify-between">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getGradeBadge(grade)}`}>
                                                {grade}
                                            </span>
                                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                {gradeDistribution[grade] || 0} orang
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filter Data</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Mata Kuliah */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Mata Kuliah
                                    </label>
                                    <select
                                        value={selectedMataKuliah}
                                        onChange={(e) => setSelectedMataKuliah(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="">Semua Mata Kuliah</option>
                                        {mataKuliahList.map((mk) => (
                                            <option key={mk.id} value={mk.id}>
                                                {mk.kode_mk} - {mk.nama_mk}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Kelas */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Kelas
                                    </label>
                                    <select
                                        value={selectedKelas}
                                        onChange={(e) => setSelectedKelas(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="">Semua Kelas</option>
                                        {kelasList.map((kelas) => (
                                            <option key={kelas.id} value={kelas.id}>
                                                {kelas.nama_kelas}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Semester */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Semester
                                    </label>
                                    <select
                                        value={selectedSemester}
                                        onChange={(e) => setSelectedSemester(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="">Semua Semester</option>
                                        <option value="Ganjil">Ganjil</option>
                                        <option value="Genap">Genap</option>
                                    </select>
                                </div>

                                {/* Tahun Ajaran */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Tahun Ajaran
                                    </label>
                                    <select
                                        value={selectedTahunAjaran}
                                        onChange={(e) => setSelectedTahunAjaran(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="">Semua Tahun</option>
                                        <option value="2023/2024">2023/2024</option>
                                        <option value="2024/2025">2024/2025</option>
                                        <option value="2025/2026">2025/2026</option>
                                        <option value="2026/2027">2026/2027</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-4">
                                <button
                                    onClick={handleFilter}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                                >
                                    Terapkan Filter
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="px-6 py-2 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition"
                                >
                                    Reset
                                </button>
                                <button
                                    onClick={() => router.get('/dosen/nilai')}
                                    className="px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition ml-auto"
                                >
                                    Kembali ke List
                                </button>
                            </div>
                        </div>

                        {/* Rekap Table */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                            <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600">
                                <h3 className="text-lg font-semibold text-white">
                                    Rekap Nilai per Mahasiswa
                                </h3>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                No
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                NIM
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                Nama Mahasiswa
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                Jumlah MK
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                Avg Tugas
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                Avg UTS
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                Avg UAS
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                Nilai Akhir
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                Grade
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {rekapNilai.length > 0 ? (
                                            rekapNilai.map((item, index) => (
                                                <tr key={item.mahasiswa_id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                                        {index + 1}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                                        {item.nim}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {item.nama}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            {item.kelas}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
                                                        {item.jumlah_mk}
                                                    </td>
                                                    <td className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
                                                        {item.tugas_avg.toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
                                                        {item.uts_avg.toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
                                                        {item.uas_avg.toFixed(2)}
                                                    </td>
                                                    <td className={`px-6 py-4 text-center text-sm font-bold ${getPerformanceColor(item.nilai_akhir_avg)}`}>
                                                        {item.nilai_akhir_avg.toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${getGradeBadge(item.grade_terbanyak)}`}>
                                                            {item.grade_terbanyak}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={9} className="px-6 py-12 text-center">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <svg className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                        <p className="text-gray-500 dark:text-gray-400 text-lg">
                                                            Belum ada data rekap nilai
                                                        </p>
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
