import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import MahasiswaSidebar from '@/Components/Layout/MahasiswaSidebar';
import Header from '@/Components/Layout/Header';

interface MataKuliah {
    id: number;
    nama: string;
    kode: string;
    sks: number;
}

interface Nilai {
    id: number;
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
    filters: {
        mata_kuliah_id?: number;
        semester?: string;
        tahun_ajaran?: string;
    };
}

export default function NilaiIndex({ nilai, mataKuliahList, filters }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [selectedMataKuliah, setSelectedMataKuliah] = useState(filters.mata_kuliah_id?.toString() || '');
    const [selectedSemester, setSelectedSemester] = useState(filters.semester || '');
    const [selectedTahunAjaran, setSelectedTahunAjaran] = useState(filters.tahun_ajaran || '');

    useEffect(() => {
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        setDarkMode(savedDarkMode);
    }, []);

    const handleFilter = () => {
        router.get('/mahasiswa/nilai', {
            mata_kuliah_id: selectedMataKuliah,
            semester: selectedSemester,
            tahun_ajaran: selectedTahunAjaran,
        }, {
            preserveState: true,
        });
    };

    const handleReset = () => {
        setSelectedMataKuliah('');
        setSelectedSemester('');
        setSelectedTahunAjaran('');
        router.get('/mahasiswa/nilai');
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

    // Calculate statistics
    const totalNilai = nilai.total;
    const nilaiWithGrade = nilai.data.filter(n => n.grade !== null);
    const gradeDistribution = nilaiWithGrade.reduce((acc, item) => {
        if (item.grade) {
            acc[item.grade] = (acc[item.grade] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className={darkMode ? 'dark' : ''}>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
                <Head title="Nilai Saya" />

                <MahasiswaSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeMenu="nilai" />

                <div className={`p-4 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
                    <Header
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                        darkMode={darkMode}
                        setDarkMode={setDarkMode}
                        title="Nilai Saya"
                        subtitle="Lihat nilai Anda untuk semua mata kuliah"
                    />

                    <div className="mt-6">
                        {/* Header */}
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Nilai Saya
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Lihat nilai Anda untuk semua mata kuliah
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="mb-6">
                            <button
                                onClick={() => router.get('/mahasiswa/nilai/transkrip')}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg transition flex items-center"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Lihat Transkrip Nilai
                            </button>
                        </div>

                        {/* Statistics Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mb-6">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
                                <p className="text-gray-600 dark:text-gray-400 text-xs mb-1">Total Nilai</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalNilai}</p>
                            </div>
                            {['A', 'B', 'C', 'D', 'E'].map(grade => (
                                <div key={grade} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
                                    <p className="text-gray-600 dark:text-gray-400 text-xs mb-1">Grade {grade}</p>
                                    <p className={`text-2xl font-bold ${getGradeBadge(grade).split(' ')[0].replace('bg-', 'text-')}`}>
                                        {gradeDistribution[grade] || 0}
                                    </p>
                                </div>
                            ))}
                            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-4">
                                <p className="text-blue-100 text-xs mb-1">Sudah Dinilai</p>
                                <p className="text-2xl font-bold text-white">{nilaiWithGrade.length}</p>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filter Data</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                            <th className="px-6 py-4 text-left text-sm font-semibold">No</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold">Mata Kuliah</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold">Semester</th>
                                            <th className="px-6 py-4 text-center text-sm font-semibold">Tugas (30%)</th>
                                            <th className="px-6 py-4 text-center text-sm font-semibold">UTS (30%)</th>
                                            <th className="px-6 py-4 text-center text-sm font-semibold">UAS (40%)</th>
                                            <th className="px-6 py-4 text-center text-sm font-semibold">Nilai Akhir</th>
                                            <th className="px-6 py-4 text-center text-sm font-semibold">Grade</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {nilai.data.length > 0 ? (
                                            nilai.data.map((item, index) => (
                                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                                        {(nilai.current_page - 1) * nilai.per_page + index + 1}
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
                                                        {item.tugas !== null ? item.tugas.toFixed(2) : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
                                                        {item.uts !== null ? item.uts.toFixed(2) : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
                                                        {item.uas !== null ? item.uas.toFixed(2) : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-center text-sm font-bold text-blue-600 dark:text-blue-400">
                                                        {item.nilai_akhir !== null ? item.nilai_akhir.toFixed(2) : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {item.grade ? (
                                                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${getGradeBadge(item.grade)}`}>
                                                                {item.grade}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400 dark:text-gray-500 text-sm">Belum dinilai</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={8} className="px-6 py-12 text-center">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <svg className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                        <p className="text-gray-500 dark:text-gray-400 text-lg">
                                                            Belum ada data nilai
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
                                                    onClick={() => router.get(`/mahasiswa/nilai?page=${page}`, filters, { preserveState: true })}
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

                        {/* Info Box */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 p-6 rounded-lg mt-6">
                            <div className="flex">
                                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <h4 className="text-blue-900 dark:text-blue-300 font-semibold mb-2">
                                        Keterangan Penilaian
                                    </h4>
                                    <ul className="text-blue-700 dark:text-blue-400 text-sm space-y-1">
                                        <li>• Nilai Akhir = (30% × Tugas) + (30% × UTS) + (40% × UAS)</li>
                                        <li>• Grade A: ≥ 85 | Grade B: 70-84 | Grade C: 60-69 | Grade D: 50-59 | Grade E: &lt; 50</li>
                                        <li>• Jika ada komponen nilai yang belum diinput, nilai akhir belum dapat dihitung</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
