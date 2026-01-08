import { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DosenSidebar from '@/Components/Layout/DosenSidebar';
import Header from '@/Components/Layout/Header';
import { route } from '@/utils/route';

interface MataKuliah {
    id: number;
    nama: string;
    kode: string;
    sks: number;
}

interface Prodi {
    id: number;
    nama: string;
    fakultas: {
        id: number;
        nama: string;
    };
}

interface Kelas {
    id: number;
    nama_kelas: string;
    tahun_ajaran: string;
    semester: string;
    prodi: Prodi;
    mata_kuliah: MataKuliah[];
    jumlah_mahasiswa: number;
}

interface Props {
    kelas: Kelas[];
    dosen: {
        id: number;
        nama: string;
        nidn: string;
    };
    filters: {
        search?: string;
        prodi_id?: number;
    };
}

export default function KelasIndex({ kelas, dosen, filters }: Props) {
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

    const [search, setSearch] = useState(filters.search || '');

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('darkMode', String(darkMode));
    }, [darkMode]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('dosen.kelas.index'), {
            search: search,
        }, {
            preserveState: true,
        });
    };

    const getSemesterBadge = (semester: string) => {
        return semester === 'Ganjil' 
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    };

    return (
        <div className={darkMode ? 'dark' : ''}>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
                <Head title="Kelas yang Diampu" />

                <DosenSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeMenu="kelas" />

                <div className={`p-4 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
                    <Header
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                        darkMode={darkMode}
                        setDarkMode={setDarkMode}
                        title="Kelas yang Diampu"
                        subtitle="Lihat daftar kelas yang Anda ampu"
                    />

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-blue-500 rounded-lg p-3">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Kelas</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{kelas.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-green-500 rounded-lg p-3">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Mahasiswa</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {kelas.reduce((sum, k) => sum + k.jumlah_mahasiswa, 0)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-purple-500 rounded-lg p-3">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Mata Kuliah</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {kelas.reduce((sum, k) => sum + k.mata_kuliah.length, 0)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari kelas atau tahun ajaran..."
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            />
                            <button
                                type="submit"
                                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                            >
                                Cari
                            </button>
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearch('');
                                        router.get(route('dosen.kelas.index'));
                                    }}
                                    className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                                >
                                    Reset
                                </button>
                            )}
                        </form>
                    </div>

                    {/* Kelas Grid */}
                    {kelas.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Tidak ada kelas</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {search ? 'Tidak ada kelas yang sesuai dengan pencarian.' : 'Anda belum mengampu kelas apapun.'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {kelas.map((item) => (
                                <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                                        <h3 className="text-xl font-bold text-white">{item.nama_kelas}</h3>
                                        <p className="text-blue-100 text-sm">{item.prodi.nama}</p>
                                    </div>
                                    <div className="p-6">
                                        <div className="space-y-3 mb-4">
                                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                                <span>{item.prodi.fakultas.nama}</span>
                                            </div>
                                            <div className="flex items-center text-sm">
                                                <svg className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span className="text-gray-600 dark:text-gray-400 mr-2">{item.tahun_ajaran}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSemesterBadge(item.semester)}`}>
                                                    {item.semester}
                                                </span>
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                                <span>{item.jumlah_mahasiswa} Mahasiswa</span>
                                            </div>
                                        </div>

                                        {/* Mata Kuliah */}
                                        {item.mata_kuliah.length > 0 && (
                                            <div className="mb-4">
                                                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Mata Kuliah:</h4>
                                                <div className="space-y-1">
                                                    {item.mata_kuliah.map((mk) => (
                                                        <div key={mk.id} className="text-sm text-gray-700 dark:text-gray-300">
                                                            <span className="font-medium">{mk.kode}</span> - {mk.nama} ({mk.sks} SKS)
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Action Button */}
                                        <Link
                                            href={route('dosen.kelas.mahasiswa', item.id)}
                                            className="block w-full text-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                                        >
                                            Lihat Mahasiswa
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
