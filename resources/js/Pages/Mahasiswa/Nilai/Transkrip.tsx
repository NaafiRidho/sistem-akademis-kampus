import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import MahasiswaSidebar from '@/Components/Layout/MahasiswaSidebar';
import Header from '@/Components/Layout/Header';

interface NilaiPerSemester {
    semester: string;
    tahun_ajaran: string;
    mata_kuliah: {
        kode: string;
        nama: string;
        sks: number;
        tugas: number | null;
        uts: number | null;
        uas: number | null;
        nilai_akhir: number | null;
        grade: string | null;
    }[];
    total_sks: number;
    ips: number;
}

interface Props {
    mahasiswa: any;
    transkrip: NilaiPerSemester[];
    ipk: number;
    total_sks_lulus: number;
}

export default function NilaiTranskrip({ mahasiswa, transkrip, ipk, total_sks_lulus }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        setDarkMode(savedDarkMode);
    }, []);

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

    const getIPKColor = (ipk: number) => {
        if (ipk >= 3.5) return 'text-green-600 dark:text-green-400';
        if (ipk >= 3.0) return 'text-blue-600 dark:text-blue-400';
        if (ipk >= 2.5) return 'text-yellow-600 dark:text-yellow-400';
        if (ipk >= 2.0) return 'text-orange-600 dark:text-orange-400';
        return 'text-red-600 dark:text-red-400';
    };

    const getPredicate = (ipk: number) => {
        if (ipk >= 3.5) return 'Cumlaude';
        if (ipk >= 3.0) return 'Sangat Memuaskan';
        if (ipk >= 2.5) return 'Memuaskan';
        return 'Cukup';
    };

    return (
        <div className={darkMode ? 'dark' : ''}>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
                <Head title="Transkrip Nilai" />

                <MahasiswaSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeMenu="nilai" />

                <div className={`p-4 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
                    <Header
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                        darkMode={darkMode}
                        setDarkMode={setDarkMode}
                        title="Transkrip Nilai"
                        subtitle="Riwayat nilai akademik lengkap dengan IPS dan IPK"
                    />

                    <div className="mt-6">
                        {/* Header */}
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Transkrip Nilai Akademik
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Riwayat nilai lengkap untuk semua semester
                            </p>
                        </div>

                        {/* Back Button */}
                        <div className="mb-6">
                            <button
                                onClick={() => router.get('/mahasiswa/nilai')}
                                className="px-6 py-2 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition flex items-center"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Kembali ke Nilai
                            </button>
                        </div>

                        {/* Student Info */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 mb-6 text-white">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-blue-100 text-sm mb-1">NIM</p>
                                    <p className="text-xl font-bold">{mahasiswa.nim}</p>
                                </div>
                                <div>
                                    <p className="text-blue-100 text-sm mb-1">Nama</p>
                                    <p className="text-xl font-bold">{mahasiswa.nama}</p>
                                </div>
                                <div>
                                    <p className="text-blue-100 text-sm mb-1">Program Studi</p>
                                    <p className="text-lg font-semibold">{mahasiswa.prodi}</p>
                                </div>
                                <div>
                                    <p className="text-blue-100 text-sm mb-1">Kelas</p>
                                    <p className="text-lg font-semibold">{mahasiswa.kelas}</p>
                                </div>
                            </div>
                        </div>

                        {/* IPK Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">IPK (Indeks Prestasi Kumulatif)</p>
                                        <p className={`text-5xl font-bold ${getIPKColor(ipk)}`}>
                                            {ipk.toFixed(2)}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                            Predikat: <span className="font-semibold">{getPredicate(ipk)}</span>
                                        </p>
                                    </div>
                                    <div className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-full">
                                        <svg className="w-12 h-12 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Total SKS Lulus</p>
                                <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                                    {total_sks_lulus}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                    SKS Kumulatif
                                </p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Total Semester</p>
                                <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                                    {transkrip.length}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                    Periode Akademik
                                </p>
                            </div>
                        </div>

                        {/* Transkrip per Semester */}
                        {transkrip.map((semester, semesterIndex) => (
                            <div key={semesterIndex} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-6">
                                <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="text-lg font-semibold">
                                                Semester {semester.semester} - {semester.tahun_ajaran}
                                            </h3>
                                            <p className="text-blue-100 text-sm">
                                                {semester.mata_kuliah.length} Mata Kuliah | {semester.total_sks} SKS
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-blue-100 text-sm">IPS</p>
                                            <p className="text-2xl font-bold">{semester.ips.toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
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
                                                    Tugas
                                                </th>
                                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                    UTS
                                                </th>
                                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                    UAS
                                                </th>
                                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                    Nilai Akhir
                                                </th>
                                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                    Grade
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {semester.mata_kuliah.map((mk, mkIndex) => (
                                                <tr key={mkIndex} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                                                        {mk.kode}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                                        {mk.nama}
                                                    </td>
                                                    <td className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
                                                        {mk.sks}
                                                    </td>
                                                    <td className="px-6 py-4 text-center text-sm text-gray-700 dark:text-gray-300">
                                                        {mk.tugas !== null ? mk.tugas.toFixed(2) : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-center text-sm text-gray-700 dark:text-gray-300">
                                                        {mk.uts !== null ? mk.uts.toFixed(2) : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-center text-sm text-gray-700 dark:text-gray-300">
                                                        {mk.uas !== null ? mk.uas.toFixed(2) : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-center text-sm font-bold text-blue-600 dark:text-blue-400">
                                                        {mk.nilai_akhir !== null ? mk.nilai_akhir.toFixed(2) : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {mk.grade ? (
                                                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${getGradeBadge(mk.grade)}`}>
                                                                {mk.grade}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400 dark:text-gray-500 text-sm">-</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <td colSpan={2} className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white text-right">
                                                    Total SKS Semester
                                                </td>
                                                <td className="px-6 py-4 text-center text-sm font-bold text-gray-900 dark:text-white">
                                                    {semester.total_sks}
                                                </td>
                                                <td colSpan={4} className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white text-right">
                                                    IPS
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`text-2xl font-bold ${getIPKColor(semester.ips)}`}>
                                                        {semester.ips.toFixed(2)}
                                                    </span>
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        ))}

                        {/* Empty State */}
                        {transkrip.length === 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
                                <svg className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="text-gray-500 dark:text-gray-400 text-lg">
                                    Belum ada data nilai
                                </p>
                            </div>
                        )}

                        {/* Final Summary */}
                        {transkrip.length > 0 && (
                            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg p-8 text-white">
                                <h3 className="text-2xl font-bold mb-6 text-center">Ringkasan Akhir</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="text-center">
                                        <p className="text-purple-100 text-sm mb-2">Total SKS Lulus</p>
                                        <p className="text-5xl font-bold">{total_sks_lulus}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-purple-100 text-sm mb-2">IPK</p>
                                        <p className="text-5xl font-bold">{ipk.toFixed(2)}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-purple-100 text-sm mb-2">Predikat</p>
                                        <p className="text-3xl font-bold mt-3">{getPredicate(ipk)}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Info Box */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 p-6 rounded-lg mt-6">
                            <div className="flex">
                                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <h4 className="text-blue-900 dark:text-blue-300 font-semibold mb-2">
                                        Keterangan
                                    </h4>
                                    <ul className="text-blue-700 dark:text-blue-400 text-sm space-y-1">
                                        <li>• IPS (Indeks Prestasi Semester) = Rata-rata nilai per semester</li>
                                        <li>• IPK (Indeks Prestasi Kumulatif) = Rata-rata nilai keseluruhan semester</li>
                                        <li>• Bobot Penilaian: Tugas 30%, UTS 30%, UAS 40%</li>
                                        <li>• Konversi Grade: A(4.0), B(3.0), C(2.0), D(1.0), E(0.0)</li>
                                        <li>• Predikat: Cumlaude (IPK ≥ 3.5), Sangat Memuaskan (3.0-3.49), Memuaskan (2.5-2.99)</li>
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
