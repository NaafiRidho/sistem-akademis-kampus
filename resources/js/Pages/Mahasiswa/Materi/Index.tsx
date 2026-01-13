import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
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

interface Materi {
    id: number;
    judul: string;
    deskripsi: string;
    file_path: string;
    created_at: string;
    mata_kuliah: MataKuliah;
    dosen: Dosen;
}

interface PaginatedMateri {
    data: Materi[];
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
    materi: PaginatedMateri;
    mataKuliahList: MataKuliah[];
    filters: {
        mata_kuliah_id?: number;
        search?: string;
    };
}

export default function MateriIndex({ materi, mataKuliahList, filters }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [search, setSearch] = useState(filters.search || '');
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
        router.get('/mahasiswa/materi', {
            search: search || undefined,
            mata_kuliah_id: selectedMataKuliah || undefined,
        }, { preserveState: true });
    };

    const resetFilters = () => {
        setSearch('');
        setSelectedMataKuliah('');
        router.get('/mahasiswa/materi', {}, { preserveState: true });
    };

    const handleDownload = (id: number) => {
        window.location.href = `/mahasiswa/materi/${id}/download`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const getFileIcon = (filePath: string) => {
        const ext = filePath.split('.').pop()?.toLowerCase();
        if (['pdf'].includes(ext || '')) {
            return (
                <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                </svg>
            );
        } else if (['doc', 'docx'].includes(ext || '')) {
            return (
                <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                </svg>
            );
        } else if (['ppt', 'pptx'].includes(ext || '')) {
            return (
                <svg className="w-8 h-8 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                </svg>
            );
        }
        return (
            <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
            </svg>
        );
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
            <Head title="Materi Kuliah" />

            <MahasiswaSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeMenu="materi" />

            <div className={`p-4 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
                <Header
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    darkMode={darkMode}
                    setDarkMode={setDarkMode}
                    title="Materi Kuliah"
                    subtitle="Akses materi pembelajaran dari dosen"
                />

                <div className="space-y-6">
                    {/* Search and Filter */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Cari Materi
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
                                        Filter Mata Kuliah
                                    </label>
                                    <select
                                        value={selectedMataKuliah}
                                        onChange={(e) => {
                                            setSelectedMataKuliah(e.target.value);
                                        }}
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

                    {/* Materi Cards */}
                    {materi.data.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {materi.data.map((item) => (
                                    <div
                                        key={item.id}
                                        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition"
                                    >
                                        <div className="p-6">
                                            <div className="flex items-start space-x-4 mb-4">
                                                <div className="flex-shrink-0">
                                                    {getFileIcon(item.file_path)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1 line-clamp-2">
                                                        {item.judul}
                                                    </h3>
                                                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                                                        {item.mata_kuliah.kode_mk}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                                                {item.deskripsi}
                                            </p>

                                            <div className="space-y-2 mb-4">
                                                <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                                                    <svg className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    {item.dosen.nama}
                                                </div>
                                                <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                                                    <svg className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    {formatDate(item.created_at)}
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleDownload(item.id)}
                                                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition flex items-center justify-center"
                                            >
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                                Download Materi
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {materi.last_page > 1 && (
                                <Pagination
                                    currentPage={materi.current_page}
                                    lastPage={materi.last_page}
                                    total={materi.total}
                                    perPage={materi.per_page}
                                />
                            )}
                        </>
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center border border-gray-200 dark:border-gray-700">
                            <svg className="w-20 h-20 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                                Belum Ada Materi
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Materi pembelajaran belum tersedia atau tidak ditemukan
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
