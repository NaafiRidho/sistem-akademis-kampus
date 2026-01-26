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

interface Jadwal {
    id: number;
    hari: string;
    jam_mulai: string;
    jam_selesai: string;
}

interface Absensi {
    id: number;
    mata_kuliah: MataKuliah;
    jadwal: Jadwal;
    tanggal: string;
    status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa';
    keterangan: string | null;
    pertemuan_ke: number;
}

interface PaginatedAbsensi {
    data: Absensi[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    absensi: PaginatedAbsensi;
    mataKuliahList: any[];
    statistik: {
        total: number;
        hadir: number;
        izin: number;
        sakit: number;
        alpa: number;
        persentase_kehadiran: number;
    };
    filters: {
        mata_kuliah_id?: number;
        status?: string;
        bulan?: string;
    };
}

export default function AbsensiIndex({ absensi, mataKuliahList, statistik, filters }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [selectedMataKuliah, setSelectedMataKuliah] = useState(filters.mata_kuliah_id?.toString() || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [selectedBulan, setSelectedBulan] = useState(filters.bulan || '');

    useEffect(() => {
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        setDarkMode(savedDarkMode);
    }, []);

    const handleFilter = () => {
        router.get('/mahasiswa/absensi', {
            mata_kuliah_id: selectedMataKuliah,
            status: selectedStatus,
            bulan: selectedBulan,
        }, {
            preserveState: true,
        });
    };

    const handleReset = () => {
        setSelectedMataKuliah('');
        setSelectedStatus('');
        setSelectedBulan('');
        router.get('/mahasiswa/absensi');
    };

    const getStatusBadge = (status: string) => {
        const badges: Record<string, string> = {
            'Hadir': 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
            'Izin': 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
            'Sakit': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
            'Alpa': 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
        };
        return badges[status] || 'bg-gray-100 text-gray-700';
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    };

    return (
        <div className={darkMode ? 'dark' : ''}>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
                <Head title="Riwayat Absensi" />

                <MahasiswaSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeMenu="absensi" />

                <div className={`p-4 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
                    <Header
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                        darkMode={darkMode}
                        setDarkMode={setDarkMode}
                        title="Riwayat Absensi"
                        subtitle="Lihat riwayat kehadiran Anda di semua mata kuliah"
                    />

                    <div className="mt-6">
                        {/* Header */}
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Riwayat Absensi Saya
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Lihat riwayat kehadiran Anda di semua mata kuliah
                            </p>
                        </div>

                        {/* Statistics Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
                                <p className="text-gray-600 dark:text-gray-400 text-xs mb-1">Total</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistik.total}</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
                                <p className="text-gray-600 dark:text-gray-400 text-xs mb-1">Hadir</p>
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{statistik.hadir}</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
                                <p className="text-gray-600 dark:text-gray-400 text-xs mb-1">Izin</p>
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{statistik.izin}</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
                                <p className="text-gray-600 dark:text-gray-400 text-xs mb-1">Sakit</p>
                                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{statistik.sakit}</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
                                <p className="text-gray-600 dark:text-gray-400 text-xs mb-1">Alpa</p>
                                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{statistik.alpa}</p>
                            </div>
                            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-4">
                                <p className="text-blue-100 text-xs mb-1">Kehadiran</p>
                                <p className="text-2xl font-bold text-white">{statistik.persentase_kehadiran.toFixed(1)}%</p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mb-6">
                            <button
                                onClick={() => router.get('/mahasiswa/absensi/rekap')}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg transition flex items-center"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Lihat Rekap per Mata Kuliah
                            </button>
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

                                {/* Status */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Status
                                    </label>
                                    <select
                                        value={selectedStatus}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="">Semua Status</option>
                                        <option value="Hadir">Hadir</option>
                                        <option value="Izin">Izin</option>
                                        <option value="Sakit">Sakit</option>
                                        <option value="Alpa">Alpa</option>
                                    </select>
                                </div>

                                {/* Bulan */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Bulan
                                    </label>
                                    <select
                                        value={selectedBulan}
                                        onChange={(e) => setSelectedBulan(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="">Semua Bulan</option>
                                        <option value="01">Januari</option>
                                        <option value="02">Februari</option>
                                        <option value="03">Maret</option>
                                        <option value="04">April</option>
                                        <option value="05">Mei</option>
                                        <option value="06">Juni</option>
                                        <option value="07">Juli</option>
                                        <option value="08">Agustus</option>
                                        <option value="09">September</option>
                                        <option value="10">Oktober</option>
                                        <option value="11">November</option>
                                        <option value="12">Desember</option>
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
                                            <th className="px-6 py-4 text-left text-sm font-semibold">Tanggal</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold">Mata Kuliah</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold">Jadwal</th>
                                            <th className="px-6 py-4 text-center text-sm font-semibold">Pertemuan</th>
                                            <th className="px-6 py-4 text-center text-sm font-semibold">Status</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold">Keterangan</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {absensi.data.length > 0 ? (
                                            absensi.data.map((item, index) => (
                                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                                        {(absensi.current_page - 1) * absensi.per_page + index + 1}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                                        {formatDate(item.tanggal)}
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
                                                        {item.jadwal.hari}, {item.jadwal.jam_mulai.substring(0, 5)} - {item.jadwal.jam_selesai.substring(0, 5)}
                                                    </td>
                                                    <td className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
                                                        {item.pertemuan_ke}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(item.status)}`}>
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                                        {item.keterangan || '-'}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-12 text-center">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <svg className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                        </svg>
                                                        <p className="text-gray-500 dark:text-gray-400 text-lg">
                                                            Belum ada data absensi
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {absensi.last_page > 1 && (
                                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            Menampilkan {absensi.data.length} dari {absensi.total} data
                                        </p>
                                        <div className="flex gap-2">
                                            {Array.from({ length: absensi.last_page }, (_, i) => i + 1).map((page) => (
                                                <button
                                                    key={page}
                                                    onClick={() => router.get(`/mahasiswa/absensi?page=${page}`, filters, { preserveState: true })}
                                                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                                                        page === absensi.current_page
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
