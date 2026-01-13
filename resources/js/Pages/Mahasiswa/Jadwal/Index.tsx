import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import MahasiswaSidebar from '@/Components/Layout/MahasiswaSidebar';
import Header from '@/Components/Layout/Header';

interface MataKuliah {
    id: number;
    nama_mk: string;
    kode_mk: string;
    sks: number;
}

interface Dosen {
    id: number;
    nama: string;
    nidn: string;
}

interface Prodi {
    id: number;
    nama: string;
}

interface Kelas {
    id: number;
    nama_kelas: string;
    prodi: Prodi;
}

interface Jadwal {
    id: number;
    hari: string;
    jam_mulai: string;
    jam_selesai: string;
    ruangan: string;
    mata_kuliah: MataKuliah;
    dosen: Dosen;
    kelas: Kelas;
}

interface Mahasiswa {
    id: number;
    nim: string;
    nama: string;
}

interface Props {
    mahasiswa: Mahasiswa;
    jadwal: Jadwal[];
    jadwalGrouped: Record<string, Jadwal[]>;
    filters: {
        hari?: string;
    };
}

export default function JadwalIndex({ mahasiswa, jadwal, jadwalGrouped, filters }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [selectedHari, setSelectedHari] = useState(filters.hari || '');

    const hariOptions = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

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

    const handleFilterChange = (hari: string) => {
        setSelectedHari(hari);
        router.get('/mahasiswa/jadwal', { hari: hari || undefined }, { preserveState: true });
    };

    const formatTime = (time: string) => {
        return time.substring(0, 5);
    };

    const getHariColor = (hari: string) => {
        const colors: Record<string, string> = {
            'Senin': 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
            'Selasa': 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
            'Rabu': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
            'Kamis': 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
            'Jumat': 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
            'Sabtu': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400',
            'Minggu': 'bg-pink-100 text-pink-700 dark:bg-pink-900/20 dark:text-pink-400',
        };
        return colors[hari] || 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400';
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
            <Head title="Jadwal Kuliah" />

            <MahasiswaSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeMenu="jadwal" />

            <div className={`p-4 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
                <Header
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    darkMode={darkMode}
                    setDarkMode={setDarkMode}
                    title="Jadwal Kuliah"
                    subtitle="Lihat jadwal perkuliahan Anda"
                />

                <div className="space-y-6">
                    {/* Filter Hari */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Filter Berdasarkan Hari
                        </label>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => handleFilterChange('')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                    selectedHari === ''
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                                Semua Hari
                            </button>
                            {hariOptions.map((hari) => (
                                <button
                                    key={hari}
                                    onClick={() => handleFilterChange(hari)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                        selectedHari === hari
                                            ? 'bg-green-600 text-white'
                                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    {hari}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Jadwal Cards */}
                    {selectedHari === '' ? (
                        // Tampilan per hari
                        <div className="space-y-6">
                            {Object.entries(jadwalGrouped).map(([hari, jadwalList]) => (
                                <div key={hari} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
                                            <span className={`px-3 py-1 rounded-lg text-sm ${getHariColor(hari)}`}>
                                                {hari}
                                            </span>
                                            <span className="ml-3 text-gray-500 dark:text-gray-400 text-sm">
                                                {jadwalList.length} mata kuliah
                                            </span>
                                        </h3>
                                    </div>
                                    <div className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {jadwalList.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                                                >
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div>
                                                            <h4 className="font-semibold text-gray-800 dark:text-white">
                                                                {item.mata_kuliah.nama_mk}
                                                            </h4>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                {item.mata_kuliah.kode_mk} • {item.mata_kuliah.sks} SKS
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                                                            <svg className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            {formatTime(item.jam_mulai)} - {formatTime(item.jam_selesai)}
                                                        </div>
                                                        <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                                                            <svg className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                            </svg>
                                                            {item.dosen.nama}
                                                        </div>
                                                        <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                                                            <svg className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                            </svg>
                                                            {item.ruangan}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        // Tampilan hari terpilih
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
                                    <span className={`px-3 py-1 rounded-lg text-sm ${getHariColor(selectedHari)}`}>
                                        {selectedHari}
                                    </span>
                                    <span className="ml-3 text-gray-500 dark:text-gray-400 text-sm">
                                        {jadwal.length} mata kuliah
                                    </span>
                                </h3>
                            </div>
                            <div className="p-6">
                                {jadwal.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {jadwal.map((item) => (
                                            <div
                                                key={item.id}
                                                className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-800 dark:text-white">
                                                            {item.mata_kuliah.nama_mk}
                                                        </h4>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            {item.mata_kuliah.kode_mk} • {item.mata_kuliah.sks} SKS
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                                                        <svg className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        {formatTime(item.jam_mulai)} - {formatTime(item.jam_selesai)}
                                                    </div>
                                                    <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                                                        <svg className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                        {item.dosen.nama}
                                                    </div>
                                                    <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                                                        <svg className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                        </svg>
                                                        {item.ruangan}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <svg className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-gray-500 dark:text-gray-400">Tidak ada jadwal pada hari ini</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {jadwal.length === 0 && selectedHari === '' && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center border border-gray-200 dark:border-gray-700">
                            <svg className="w-20 h-20 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                                Belum Ada Jadwal
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Jadwal kuliah Anda belum tersedia
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
