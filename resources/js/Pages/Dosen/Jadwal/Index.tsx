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

interface Kelas {
    id: number;
    nama_kelas: string;
}

interface Jadwal {
    id: number;
    hari: string;
    jam_mulai: string;
    jam_selesai: string;
    ruangan: string;
    mata_kuliah: MataKuliah;
    kelas: Kelas;
}

interface JadwalGrouped {
    [hari: string]: Jadwal[];
}

interface Props {
    jadwal: JadwalGrouped;
    jadwalFlat: Jadwal[];
    filter: string;
    tanggal: string;
    stats: {
        total_mata_kuliah: number;
        total_kelas: number;
        total_jam_minggu: number;
    };
    dosen: {
        id: number;
        nama: string;
        nidn: string;
    };
}

export default function JadwalIndex({ jadwal, jadwalFlat, filter, tanggal, stats, dosen }: Props) {
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

    const [currentFilter, setCurrentFilter] = useState(filter);
    const [currentDate, setCurrentDate] = useState(tanggal);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('darkMode', String(darkMode));
    }, [darkMode]);

    const handleFilterChange = (newFilter: string) => {
        setCurrentFilter(newFilter);
        router.get(route('dosen.jadwal.index'), {
            filter: newFilter,
            tanggal: currentDate,
        }, {
            preserveState: true,
        });
    };

    const hariOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

    const getHariColor = (hari: string) => {
        const colors: { [key: string]: string } = {
            'Senin': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            'Selasa': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            'Rabu': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            'Kamis': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
            'Jumat': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
            'Sabtu': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
            'Minggu': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        };
        return colors[hari] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    };

    return (
        <div className={darkMode ? 'dark' : ''}>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
                <Head title="Jadwal Mengajar" />

                <DosenSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeMenu="jadwal" />

                <div className={`p-4 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
                    <Header
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                        darkMode={darkMode}
                        setDarkMode={setDarkMode}
                        title="Jadwal Mengajar"
                        subtitle="Lihat dan kelola jadwal mengajar Anda"
                    />

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-blue-500 rounded-lg p-3">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Mata Kuliah</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_mata_kuliah}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-green-500 rounded-lg p-3">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Kelas</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_kelas}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-purple-500 rounded-lg p-3">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Jam/Minggu</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {stats.total_jam_minggu % 1 === 0 
                                            ? stats.total_jam_minggu 
                                            : stats.total_jam_minggu.toFixed(1)
                                        } jam
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filter Buttons */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => handleFilterChange('hari')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    currentFilter === 'hari'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                                Hari Ini
                            </button>
                            <button
                                onClick={() => handleFilterChange('minggu')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    currentFilter === 'minggu'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                                Minggu Ini
                            </button>
                            <button
                                onClick={() => handleFilterChange('bulan')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    currentFilter === 'bulan'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                                Semua Jadwal
                            </button>
                        </div>
                    </div>

                    {/* Jadwal List */}
                    <div className="space-y-6">
                        {jadwalFlat.length === 0 ? (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Tidak ada jadwal</h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Tidak ada jadwal mengajar untuk periode yang dipilih.
                                </p>
                            </div>
                        ) : (
                            hariOrder.map((hari) => {
                                const jadwalHari = jadwal[hari] || [];
                                if (jadwalHari.length === 0) return null;

                                return (
                                    <div key={hari} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                                        <div className={`px-6 py-4 border-b border-gray-200 dark:border-gray-700 ${getHariColor(hari)}`}>
                                            <h3 className="text-lg font-semibold">{hari}</h3>
                                            <p className="text-sm opacity-75">{jadwalHari.length} jadwal</p>
                                        </div>
                                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {jadwalHari.map((item) => (
                                                <div key={item.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                                        <div className="flex-1">
                                                            <div className="flex items-start gap-3">
                                                                <div className="flex-shrink-0">
                                                                    <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-2">
                                                                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                                        </svg>
                                                                    </div>
                                                                </div>
                                                                <div className="flex-1">
                                                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                                        {item.mata_kuliah.nama}
                                                                    </h4>
                                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                                                        {item.mata_kuliah.kode} • {item.mata_kuliah.sks} SKS
                                                                    </p>
                                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                                            </svg>
                                                                            {item.kelas.nama_kelas}
                                                                        </span>
                                                                        {item.ruangan && (
                                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                                                </svg>
                                                                                {item.ruangan}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="text-right">
                                                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                                                    {item.jam_mulai.substring(0, 5)}
                                                                </p>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                    {item.jam_selesai.substring(0, 5)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
