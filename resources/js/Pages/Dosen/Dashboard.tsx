import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import DosenSidebar from '@/Components/Layout/DosenSidebar';
import Header from '@/Components/Layout/Header';

interface Props {
    dosen: {
        id: number;
        nama: string;
        nidn: string;
        email: string;
        prodi: {
            id: number;
            nama: string;
        };
    };
    stats: {
        total_mata_kuliah: number;
        total_kelas: number;
        total_mahasiswa: number;
        jadwal_hari_ini: number;
    };
    jadwal_hari_ini: Array<{
        id: number;
        hari: string;
        jam_mulai: string;
        jam_selesai: string;
        mata_kuliah: {
            id: number;
            nama: string;
            kode: string;
        };
        kelas: {
            id: number;
            nama: string;
        };
        ruangan: {
            id: number;
            nama: string;
        } | null;
    }>;
    recent_nilai: Array<{
        id: number;
        nilai: number;
        grade: string;
        mahasiswa: {
            id: number;
            nim: string;
            nama: string;
        };
        mata_kuliah: {
            id: number;
            nama: string;
            kode: string;
        };
    }>;
    hari: string;
}

export default function Dashboard({ dosen, stats, jadwal_hari_ini, recent_nilai, hari }: Props) {
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
                <Head title="Dashboard Dosen" />

                <DosenSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeMenu="dashboard" />

                <div className={`p-4 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
                    <Header
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                        darkMode={darkMode}
                        setDarkMode={setDarkMode}
                        title="Dashboard Dosen"
                        subtitle={`Selamat datang, ${dosen.nama}`}
                    />

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
                        {/* Total Mata Kuliah */}
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm mb-1">Mata Kuliah</p>
                                    <p className="text-3xl font-bold">{stats.total_mata_kuliah}</p>
                                </div>
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Total Kelas */}
                        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 text-sm mb-1">Total Kelas</p>
                                    <p className="text-3xl font-bold">{stats.total_kelas}</p>
                                </div>
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Total Mahasiswa */}
                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-100 text-sm mb-1">Mahasiswa</p>
                                    <p className="text-3xl font-bold">{stats.total_mahasiswa}</p>
                                </div>
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Jadwal Hari Ini */}
                        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-amber-100 text-sm mb-1">Jadwal Hari Ini</p>
                                    <p className="text-3xl font-bold">{stats.jadwal_hari_ini}</p>
                                </div>
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Two Column Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                        {/* Jadwal Hari Ini */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
                                    <svg className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
                                    </svg>
                                    Jadwal Hari Ini ({hari})
                                </h2>
                            </div>
                            <div className="p-6">
                                {jadwal_hari_ini.length === 0 ? (
                                    <div className="text-center py-12">
                                        <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-gray-500 dark:text-gray-400">Tidak ada jadwal mengajar hari ini</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {jadwal_hari_ini.map((jadwal) => (
                                            <div 
                                                key={jadwal.id} 
                                                className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-lg hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-gray-800 dark:text-white">
                                                            {jadwal.mata_kuliah.nama}
                                                        </h3>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            {jadwal.mata_kuliah.kode} • Kelas {jadwal.kelas.nama}
                                                        </p>
                                                    </div>
                                                    <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-semibold rounded-full whitespace-nowrap ml-2">
                                                        {jadwal.jam_mulai} - {jadwal.jam_selesai}
                                                    </span>
                                                </div>
                                                {jadwal.ruangan && (
                                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
                                                        </svg>
                                                        {jadwal.ruangan.nama}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Nilai */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
                                    <svg className="w-6 h-6 mr-2 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
                                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"></path>
                                    </svg>
                                    Nilai Terbaru
                                </h2>
                            </div>
                            <div className="p-6">
                                {recent_nilai.length === 0 ? (
                                    <div className="text-center py-12">
                                        <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p className="text-gray-500 dark:text-gray-400">Belum ada nilai yang diinput</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead>
                                                <tr>
                                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                                        Mahasiswa
                                                    </th>
                                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                                        Mata Kuliah
                                                    </th>
                                                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                                        Nilai
                                                    </th>
                                                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                                        Grade
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                {recent_nilai.map((nilai) => (
                                                    <tr key={nilai.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                        <td className="px-3 py-3 text-sm">
                                                            <div>
                                                                <p className="font-medium text-gray-800 dark:text-white">
                                                                    {nilai.mahasiswa.nama}
                                                                </p>
                                                                <p className="text-gray-500 dark:text-gray-400 text-xs">
                                                                    {nilai.mahasiswa.nim}
                                                                </p>
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-3 text-sm text-gray-600 dark:text-gray-400">
                                                            {nilai.mata_kuliah.nama}
                                                        </td>
                                                        <td className="px-3 py-3 text-sm text-center font-semibold text-gray-800 dark:text-white">
                                                            {nilai.nilai}
                                                        </td>
                                                        <td className="px-3 py-3 text-center">
                                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                                                nilai.grade === 'A' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                                nilai.grade === 'B' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                                                nilai.grade === 'C' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                                                nilai.grade === 'D' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                                                                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                            }`}>
                                                                {nilai.grade}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
