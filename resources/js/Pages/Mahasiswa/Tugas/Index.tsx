import { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MahasiswaSidebar from '@/Components/Layout/MahasiswaSidebar';
import Header from '@/Components/Layout/Header';
import Pagination from '@/Components/Pagination';

interface MataKuliah {
    id: number;
    nama_mk: string;
    kode_mk: string;
}

interface Dosen {
    id: number;
    nama: string;
}

interface Pengumpulan {
    id: number;
    nilai: number | null;
    catatan: string | null;
    tanggal_pengumpulan: string;
    status: string;
}

interface Tugas {
    id: number;
    judul: string;
    deskripsi: string;
    deadline: string;
    file_path: string | null;
    created_at: string;
    mata_kuliah: MataKuliah;
    dosen: Dosen;
    pengumpulan: Pengumpulan | null;
    status_pengumpulan: string;
    is_terlambat: boolean;
}

interface PaginatedTugas {
    data: Tugas[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Mahasiswa {
    id: number;
    nim: string;
    nama: string;
}

interface Props {
    mahasiswa: Mahasiswa;
    tugas: PaginatedTugas;
    mataKuliahList: MataKuliah[];
    filters: {
        status?: string;
        mata_kuliah_id?: number;
        search?: string;
    };
}

export default function TugasIndex({ tugas, mataKuliahList, filters }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [search, setSearch] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [selectedMataKuliah, setSelectedMataKuliah] = useState(filters.mata_kuliah_id?.toString() || '');

    useEffect(() => {
        const isDark = localStorage.getItem('darkMode') === 'true';
        setDarkMode(isDark);
        if (isDark) {
            document.documentElement.classList.add('dark');
        }
    }, []);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('darkMode', 'true');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('darkMode', 'false');
        }
    }, [darkMode]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters();
    };

    const applyFilters = () => {
        router.get('/mahasiswa/tugas', {
            search: search || undefined,
            status: selectedStatus || undefined,
            mata_kuliah_id: selectedMataKuliah || undefined,
        }, { preserveState: true });
    };

    const resetFilters = () => {
        setSearch('');
        setSelectedStatus('');
        setSelectedMataKuliah('');
        router.get('/mahasiswa/tugas', {}, { preserveState: true });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const isDeadlineSoon = (deadline: string) => {
        const deadlineDate = new Date(deadline);
        const now = new Date();
        const diffTime = deadlineDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 3 && diffDays > 0;
    };

    const isOverdue = (deadline: string, pengumpulan: Pengumpulan | null) => {
        if (pengumpulan) return false;
        return new Date(deadline) < new Date();
    };

    const getStatusBadge = (item: Tugas) => {
        if (item.pengumpulan) {
            if (item.pengumpulan.nilai !== null) {
                return (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                        ✓ Dinilai ({item.pengumpulan.nilai})
                    </span>
                );
            }
            return (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                    ✓ Sudah Dikumpulkan
                </span>
            );
        }
        if (isOverdue(item.deadline, item.pengumpulan)) {
            return (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                    ⚠ Terlambat
                </span>
            );
        }
        if (isDeadlineSoon(item.deadline)) {
            return (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400">
                    ⏰ Segera Berakhir
                </span>
            );
        }
        return (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400">
                Belum Dikumpulkan
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
            <Head title="Tugas" />

            <MahasiswaSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeMenu="tugas" />

            <div className={`p-4 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
                <Header
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    darkMode={darkMode}
                    setDarkMode={setDarkMode}
                    title="Tugas Kuliah"
                    subtitle="Kelola dan kumpulkan tugas dari dosen"
                />

                <div className="space-y-6">
                    {/* Search and Filter */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Cari Tugas
                                    </label>
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Cari berdasarkan judul..."
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Status
                                    </label>
                                    <select
                                        value={selectedStatus}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="">Semua Status</option>
                                        <option value="belum_dikumpulkan">Belum Dikumpulkan</option>
                                        <option value="sudah_dikumpulkan">Sudah Dikumpulkan</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Mata Kuliah
                                    </label>
                                    <select
                                        value={selectedMataKuliah}
                                        onChange={(e) => setSelectedMataKuliah(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="">Semua Mata Kuliah</option>
                                        {mataKuliahList.map((mk) => (
                                            <option key={mk.id} value={mk.id}>
                                                {mk.kode_mk} - {mk.nama_mk}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                                >
                                    Cari
                                </button>
                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition"
                                >
                                    Reset
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Tugas Cards */}
                    {tugas.data.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {tugas.data.map((item) => (
                                    <div
                                        key={item.id}
                                        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition"
                                    >
                                        <div className="p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                                                        {item.judul}
                                                    </h3>
                                                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                                                        {item.mata_kuliah.kode_mk} - {item.mata_kuliah.nama_mk}
                                                    </p>
                                                </div>
                                                {getStatusBadge(item)}
                                            </div>

                                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                                                {item.deskripsi}
                                            </p>

                                            <div className="space-y-2 mb-4">
                                                <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                                                    <svg className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    {item.dosen.nama}
                                                </div>
                                                <div className={`flex items-center text-sm ${
                                                    isOverdue(item.deadline, item.pengumpulan)
                                                        ? 'text-red-600 dark:text-red-400 font-semibold'
                                                        : isDeadlineSoon(item.deadline)
                                                        ? 'text-orange-600 dark:text-orange-400 font-semibold'
                                                        : 'text-gray-700 dark:text-gray-300'
                                                }`}>
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    Deadline: {formatDate(item.deadline)}
                                                </div>
                                            </div>

                                            <Link
                                                href={`/mahasiswa/tugas/${item.id}`}
                                                className="block w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition text-center"
                                            >
                                                Lihat Detail & Kumpulkan
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {tugas.last_page > 1 && (
                                <Pagination
                                    currentPage={tugas.current_page}
                                    lastPage={tugas.last_page}
                                    total={tugas.total}
                                    perPage={tugas.per_page}
                                />
                            )}
                        </>
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center border border-gray-200 dark:border-gray-700">
                            <svg className="w-20 h-20 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                                Tidak Ada Tugas
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Belum ada tugas yang tersedia atau tidak ditemukan
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
