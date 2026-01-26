import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import DosenSidebar from '@/Components/Layout/DosenSidebar';
import Header from '@/Components/Layout/Header';

interface Mahasiswa {
    id: number;
    nim: string;
    nama: string;
    kelas: string;
    prodi: string;
}

interface MataKuliah {
    id: number;
    nama: string;
    kode: string;
    sks: number;
}

interface Nilai {
    id: number;
    mahasiswa: Mahasiswa;
    mata_kuliah: MataKuliah;
    semester: string;
    tahun_ajaran: string;
    tugas: number | null;
    uts: number | null;
    uas: number | null;
    nilai_akhir: number | null;
    grade: string | null;
}

interface PaginatedNilai {
    data: Nilai[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    nilai: PaginatedNilai;
    mataKuliahList: any[];
    kelasList: any[];
    filters: {
        mata_kuliah_id?: number;
        kelas_id?: number;
        semester?: string;
        tahun_ajaran?: string;
        search?: string;
    };
}

export default function NilaiIndex({ nilai, mataKuliahList, kelasList, filters }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedMataKuliah, setSelectedMataKuliah] = useState(filters.mata_kuliah_id?.toString() || '');
    const [selectedKelas, setSelectedKelas] = useState(filters.kelas_id?.toString() || '');
    const [selectedSemester, setSelectedSemester] = useState(filters.semester || '');
    const [selectedTahunAjaran, setSelectedTahunAjaran] = useState(filters.tahun_ajaran || '');

    useEffect(() => {
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        setDarkMode(savedDarkMode);
    }, []);

    const handleFilter = () => {
        router.get('/dosen/nilai', {
            search: searchTerm,
            mata_kuliah_id: selectedMataKuliah,
            kelas_id: selectedKelas,
            semester: selectedSemester,
            tahun_ajaran: selectedTahunAjaran,
        }, {
            preserveState: true,
        });
    };

    const handleReset = () => {
        setSearchTerm('');
        setSelectedMataKuliah('');
        setSelectedKelas('');
        setSelectedSemester('');
        setSelectedTahunAjaran('');
        router.get('/dosen/nilai');
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

    return (
        <div className={darkMode ? 'dark' : ''}>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
                <Head title="Kelola Nilai" />

                <DosenSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeMenu="nilai" />

                <div className={`p-4 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
                    <Header
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                        darkMode={darkMode}
                        setDarkMode={setDarkMode}
                        title="Kelola Nilai"
                        subtitle="Kelola nilai mahasiswa untuk mata kuliah yang Anda ajar"
                    />

                    <div className="mt-6">
                        {/* Header */}
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Kelola Nilai Mahasiswa
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Input dan kelola nilai mahasiswa untuk mata kuliah yang Anda ajar
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="mb-6 flex flex-wrap gap-3">
                            <button
                                onClick={() => router.get('/dosen/nilai/create')}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg transition flex items-center"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Input Nilai
                            </button>

                            <button
                                onClick={() => router.get('/dosen/nilai/rekap')}
                                className="px-6 py-3 bg-white dark:bg-gray-800 border-2 border-blue-600 text-blue-600 dark:text-blue-400 rounded-xl font-semibold hover:bg-blue-50 dark:hover:bg-gray-700 transition flex items-center"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Lihat Rekap
                            </button>
                        </div>

                        {/* Filters */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filter Data</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                {/* Search */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Cari Mahasiswa
                                    </label>
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleFilter()}
                                        placeholder="NIM atau Nama..."
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>

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
                            </div>
                        </div>

                        {/* Table */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-sm font-semibold">NIM</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold">Nama</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold">Mata Kuliah</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold">Semester</th>
                                            <th className="px-6 py-4 text-center text-sm font-semibold">Tugas</th>
                                            <th className="px-6 py-4 text-center text-sm font-semibold">UTS</th>
                                            <th className="px-6 py-4 text-center text-sm font-semibold">UAS</th>
                                            <th className="px-6 py-4 text-center text-sm font-semibold">Nilai Akhir</th>
                                            <th className="px-6 py-4 text-center text-sm font-semibold">Grade</th>
                                            <th className="px-6 py-4 text-center text-sm font-semibold">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {nilai.data.length > 0 ? (
                                            nilai.data.map((item) => (
                                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                                        {item.mahasiswa.nim}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {item.mahasiswa.nama}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            {item.mahasiswa.kelas} - {item.mahasiswa.prodi}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {item.mata_kuliah.nama}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            {item.mata_kuliah.kode} ({item.mata_kuliah.sks} SKS)
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                                        {item.semester} - {item.tahun_ajaran}
                                                    </td>
                                                    <td className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
                                                        {item.tugas?.toFixed(2) || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
                                                        {item.uts?.toFixed(2) || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
                                                        {item.uas?.toFixed(2) || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-center text-sm font-bold text-blue-600 dark:text-blue-400">
                                                        {item.nilai_akhir?.toFixed(2) || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {item.grade ? (
                                                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${getGradeBadge(item.grade)}`}>
                                                                {item.grade}
                                                            </span>
                                                        ) : (
                                                            '-'
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button
                                                            onClick={() => router.get(`/dosen/nilai/${item.id}/edit`)}
                                                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                                                            title="Edit"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                if (confirm('Yakin ingin menghapus nilai ini?')) {
                                                                    router.delete(`/dosen/nilai/${item.id}`);
                                                                }
                                                            }}
                                                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                                            title="Hapus"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={10} className="px-6 py-12 text-center">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <svg className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                        <p className="text-gray-500 dark:text-gray-400 text-lg">
                                                            Belum ada data nilai
                                                        </p>
                                                        <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                                                            Klik tombol "Input Nilai" untuk menambah data
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {nilai.last_page > 1 && (
                                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            Menampilkan {nilai.data.length} dari {nilai.total} data
                                        </p>
                                        <div className="flex gap-2">
                                            {Array.from({ length: nilai.last_page }, (_, i) => i + 1).map((page) => (
                                                <button
                                                    key={page}
                                                    onClick={() => router.get(`/dosen/nilai?page=${page}`, filters, { preserveState: true })}
                                                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                                                        page === nilai.current_page
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
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
