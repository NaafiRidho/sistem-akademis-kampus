import { useState, useEffect } from 'react';
import { usePage, router, Head } from '@inertiajs/react';
import Sidebar from '@/Components/Layout/Sidebar';
import Header from '@/Components/Layout/Header';

interface Stats {
    total_mahasiswa?: number;
    total_dosen?: number;
    total_fakultas?: number;
    total_prodi?: number;
}

interface AbsensiStats {
    hadir?: number;
    sakit?: number;
    izin?: number;
    alpha?: number;
}

interface GrafikNilai {
    A?: number;
    B?: number;
    C?: number;
    D?: number;
    E?: number;
}

interface DashboardProps {
    stats: Stats;
    absensi_stats: AbsensiStats;
    grafik_nilai: GrafikNilai;
}

interface AuthUser {
    name?: string;
}

interface PageProps {
    auth?: {
        user?: AuthUser;
    };
    [key: string]: any;
}

export default function Dashboard({ stats, absensi_stats, grafik_nilai }: DashboardProps) {
    const { auth } = usePage<PageProps>().props;
    const user = auth?.user;

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

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('darkMode', String(darkMode));
    }, [darkMode]);

    return (
        <div className={darkMode ? 'dark' : ''}>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
                <Head title="Dashboard" />

                <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeMenu="dashboard" />

                <div className={`p-4 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
                    <Header
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                        darkMode={darkMode}
                        setDarkMode={setDarkMode}
                        title="Dashboard Admin"
                        subtitle={`Selamat datang, ${user?.name || 'Admin'}`}
                    />

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
                        {/* Total Mahasiswa */}
                        <div 
                            onClick={() => router.get('/admin/mahasiswa')}
                            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300 cursor-pointer"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm mb-1">Total Mahasiswa</p>
                                    <p className="text-3xl font-bold">{stats?.total_mahasiswa || 0}</p>
                                    <p className="text-blue-100 text-xs mt-2">Klik untuk kelola →</p>
                                </div>
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Total Dosen (Guru) */}
                        <div 
                            onClick={() => router.get('/admin/dosen')}
                            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300 cursor-pointer"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-100 text-sm mb-1">Total Guru/Dosen</p>
                                    <p className="text-3xl font-bold">{stats?.total_dosen || 0}</p>
                                    <p className="text-purple-100 text-xs mt-2">Klik untuk kelola →</p>
                                </div>
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Total Fakultas */}
                        <div 
                            onClick={() => router.get('/admin/fakultas')}
                            className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300 cursor-pointer"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 text-sm mb-1">Fakultas</p>
                                    <p className="text-3xl font-bold">{stats?.total_fakultas || 0}</p>
                                    <p className="text-green-100 text-xs mt-2">Klik untuk kelola →</p>
                                </div>
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Total Prodi */}
                        <div 
                            onClick={() => router.get('/admin/prodi')}
                            className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300 cursor-pointer"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-orange-100 text-sm mb-1">Program Studi</p>
                                    <p className="text-3xl font-bold">{stats?.total_prodi || 0}</p>
                                    <p className="text-orange-100 text-xs mt-2">Klik untuk kelola →</p>
                                </div>
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Statistik Absensi & Grafik Nilai */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Statistik Absensi */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Statistik Absensi</h2>
                            <div className="space-y-4">
                                {/* Hadir */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Hadir</p>
                                            <p className="text-2xl font-bold text-gray-800 dark:text-white">{absensi_stats?.hadir || 0}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-green-600 dark:text-green-400 font-semibold">
                                            {((absensi_stats?.hadir || 0) / ((absensi_stats?.hadir || 0) + (absensi_stats?.sakit || 0) + (absensi_stats?.izin || 0) + (absensi_stats?.alpha || 0)) * 100 || 0).toFixed(1)}%
                                        </p>
                                    </div>
                                </div>

                                {/* Sakit */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path>
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Sakit</p>
                                            <p className="text-2xl font-bold text-gray-800 dark:text-white">{absensi_stats?.sakit || 0}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Izin */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                                            <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Izin</p>
                                            <p className="text-2xl font-bold text-gray-800 dark:text-white">{absensi_stats?.izin || 0}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Alpha */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                                            <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Alpha</p>
                                            <p className="text-2xl font-bold text-gray-800 dark:text-white">{absensi_stats?.alpha || 0}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Grafik Distribusi Nilai */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Distribusi Nilai Mahasiswa</h2>
                            <div className="space-y-3">
                                {/* Grade A */}
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Grade A (85-100)</span>
                                        <span className="text-sm font-bold text-gray-900 dark:text-white">{grafik_nilai?.A || 0}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                        <div 
                                            className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-300" 
                                            style={{ 
                                                width: grafik_nilai?.A ? `${Math.max((grafik_nilai.A / ((grafik_nilai?.A || 0) + (grafik_nilai?.B || 0) + (grafik_nilai?.C || 0) + (grafik_nilai?.D || 0) + (grafik_nilai?.E || 0))) * 100, 2)}%` : '0%'
                                            }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Grade B */}
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Grade B (70-84)</span>
                                        <span className="text-sm font-bold text-gray-900 dark:text-white">{grafik_nilai?.B || 0}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                        <div 
                                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300" 
                                            style={{ 
                                                width: grafik_nilai?.B ? `${Math.max((grafik_nilai.B / ((grafik_nilai?.A || 0) + (grafik_nilai?.B || 0) + (grafik_nilai?.C || 0) + (grafik_nilai?.D || 0) + (grafik_nilai?.E || 0))) * 100, 2)}%` : '0%'
                                            }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Grade C */}
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Grade C (60-69)</span>
                                        <span className="text-sm font-bold text-gray-900 dark:text-white">{grafik_nilai?.C || 0}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                        <div 
                                            className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-3 rounded-full transition-all duration-300" 
                                            style={{ 
                                                width: grafik_nilai?.C ? `${Math.max((grafik_nilai.C / ((grafik_nilai?.A || 0) + (grafik_nilai?.B || 0) + (grafik_nilai?.C || 0) + (grafik_nilai?.D || 0) + (grafik_nilai?.E || 0))) * 100, 2)}%` : '0%'
                                            }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Grade D */}
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Grade D (50-59)</span>
                                        <span className="text-sm font-bold text-gray-900 dark:text-white">{grafik_nilai?.D || 0}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                        <div 
                                            className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all duration-300" 
                                            style={{ 
                                                width: grafik_nilai?.D ? `${Math.max((grafik_nilai.D / ((grafik_nilai?.A || 0) + (grafik_nilai?.B || 0) + (grafik_nilai?.C || 0) + (grafik_nilai?.D || 0) + (grafik_nilai?.E || 0))) * 100, 2)}%` : '0%'
                                            }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Grade E */}
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Grade E (&lt;50)</span>
                                        <span className="text-sm font-bold text-gray-900 dark:text-white">{grafik_nilai?.E || 0}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                        <div 
                                            className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all duration-300" 
                                            style={{ 
                                                width: grafik_nilai?.E ? `${Math.max((grafik_nilai.E / ((grafik_nilai?.A || 0) + (grafik_nilai?.B || 0) + (grafik_nilai?.C || 0) + (grafik_nilai?.D || 0) + (grafik_nilai?.E || 0))) * 100, 2)}%` : '0%'
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
