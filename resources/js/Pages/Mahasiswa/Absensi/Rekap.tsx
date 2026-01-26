import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import MahasiswaSidebar from '@/Components/Layout/MahasiswaSidebar';
import Header from '@/Components/Layout/Header';

interface AbsensiSummary {
    mata_kuliah_id: number;
    kode_mk: string;
    nama_mk: string;
    sks: number;
    total: number;
    hadir: number;
    izin: number;
    sakit: number;
    alpa: number;
    persentase_kehadiran: number;
}

interface Props {
    rekapAbsensi: AbsensiSummary[];
}

export default function AbsensiRekap({ rekapAbsensi }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        setDarkMode(savedDarkMode);
    }, []);

    const getPersentaseColor = (persentase: number) => {
        if (persentase >= 80) return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
        if (persentase >= 60) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
        return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
    };

    const getPersentaseBarColor = (persentase: number) => {
        if (persentase >= 80) return 'bg-green-500';
        if (persentase >= 60) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    // Calculate overall statistics
    const totalPertemuan = rekapAbsensi.reduce((sum, item) => sum + item.total, 0);
    const totalHadir = rekapAbsensi.reduce((sum, item) => sum + item.hadir, 0);
    const totalIzin = rekapAbsensi.reduce((sum, item) => sum + item.izin, 0);
    const totalSakit = rekapAbsensi.reduce((sum, item) => sum + item.sakit, 0);
    const totalAlpa = rekapAbsensi.reduce((sum, item) => sum + item.alpa, 0);
    const overallPersentase = totalPertemuan > 0 ? (totalHadir / totalPertemuan) * 100 : 0;

    return (
        <div className={darkMode ? 'dark' : ''}>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
                <Head title="Rekap Absensi" />

                <MahasiswaSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeMenu="absensi" />

                <div className={`p-4 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
                    <Header
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                        darkMode={darkMode}
                        setDarkMode={setDarkMode}
                        title="Rekap Absensi"
                        subtitle="Ringkasan kehadiran per mata kuliah"
                    />

                    <div className="mt-6">
                        {/* Header */}
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Rekap Absensi per Mata Kuliah
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Ringkasan kehadiran Anda untuk setiap mata kuliah
                            </p>
                        </div>

                        {/* Back Button */}
                        <div className="mb-6">
                            <button
                                onClick={() => router.get('/mahasiswa/absensi')}
                                className="px-6 py-2 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition flex items-center"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Kembali ke Riwayat
                            </button>
                        </div>

                        {/* Overall Statistics */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 mb-6 text-white">
                            <h3 className="text-lg font-semibold mb-4">Statistik Keseluruhan</h3>
                            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                                <div>
                                    <p className="text-blue-100 text-sm mb-1">Total Pertemuan</p>
                                    <p className="text-2xl font-bold">{totalPertemuan}</p>
                                </div>
                                <div>
                                    <p className="text-blue-100 text-sm mb-1">Hadir</p>
                                    <p className="text-2xl font-bold">{totalHadir}</p>
                                </div>
                                <div>
                                    <p className="text-blue-100 text-sm mb-1">Izin</p>
                                    <p className="text-2xl font-bold">{totalIzin}</p>
                                </div>
                                <div>
                                    <p className="text-blue-100 text-sm mb-1">Sakit</p>
                                    <p className="text-2xl font-bold">{totalSakit}</p>
                                </div>
                                <div>
                                    <p className="text-blue-100 text-sm mb-1">Alpa</p>
                                    <p className="text-2xl font-bold">{totalAlpa}</p>
                                </div>
                                <div>
                                    <p className="text-blue-100 text-sm mb-1">Kehadiran</p>
                                    <p className="text-2xl font-bold">{overallPersentase.toFixed(1)}%</p>
                                </div>
                            </div>
                        </div>

                        {/* Rekap Table */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                No
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                Kode MK
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                Mata Kuliah
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                SKS
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                Total
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                Hadir
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                Izin
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                Sakit
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                Alpa
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                Kehadiran
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {rekapAbsensi.length > 0 ? (
                                            rekapAbsensi.map((item, index) => (
                                                <tr key={item.mata_kuliah_id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                                        {index + 1}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                                                        {item.kode_mk}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                                        {item.nama_mk}
                                                    </td>
                                                    <td className="px-6 py-4 text-center text-sm text-gray-700 dark:text-gray-300">
                                                        {item.sks}
                                                    </td>
                                                    <td className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
                                                        {item.total}
                                                    </td>
                                                    <td className="px-6 py-4 text-center text-sm font-semibold text-green-600 dark:text-green-400">
                                                        {item.hadir}
                                                    </td>
                                                    <td className="px-6 py-4 text-center text-sm font-semibold text-blue-600 dark:text-blue-400">
                                                        {item.izin}
                                                    </td>
                                                    <td className="px-6 py-4 text-center text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                                                        {item.sakit}
                                                    </td>
                                                    <td className="px-6 py-4 text-center text-sm font-semibold text-red-600 dark:text-red-400">
                                                        {item.alpa}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col items-center">
                                                            <span className={`px-3 py-1 rounded-full text-sm font-bold mb-2 ${getPersentaseColor(item.persentase_kehadiran)}`}>
                                                                {item.persentase_kehadiran.toFixed(1)}%
                                                            </span>
                                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                                <div
                                                                    className={`h-2 rounded-full ${getPersentaseBarColor(item.persentase_kehadiran)}`}
                                                                    style={{ width: `${item.persentase_kehadiran}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={10} className="px-6 py-12 text-center">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <svg className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                        </svg>
                                                        <p className="text-gray-500 dark:text-gray-400 text-lg">
                                                            Belum ada data rekap absensi
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Info Box */}
                        {rekapAbsensi.length > 0 && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 p-6 rounded-lg mt-6">
                                <div className="flex">
                                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div>
                                        <h4 className="text-blue-900 dark:text-blue-300 font-semibold mb-2">
                                            Informasi Penting
                                        </h4>
                                        <ul className="text-blue-700 dark:text-blue-400 text-sm space-y-1">
                                            <li>• Persentase kehadiran minimal 75% untuk dapat mengikuti ujian</li>
                                            <li>• Status Izin dan Sakit tidak dihitung sebagai kehadiran tetapi tidak mengurangi nilai</li>
                                            <li>• Status Alpa (tanpa keterangan) dapat mempengaruhi nilai akhir</li>
                                            <li>• Warna hijau: ≥80%, kuning: 60-79%, merah: &lt;60%</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
