import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import DosenSidebar from '@/Components/Layout/DosenSidebar';
import Header from '@/Components/Layout/Header';
import { route } from '@/utils/route';

interface User {
    id: number;
    email: string;
}

interface Prodi {
    id: number;
    nama: string;
}

interface StatistikAbsensi {
    total: number;
    hadir: number;
    persentase: number;
}

interface Mahasiswa {
    id: number;
    nim: string;
    nama: string;
    jenis_kelamin: string;
    angkatan: string;
    user: User;
    prodi: Prodi;
    statistik_absensi: StatistikAbsensi;
    rata_rata_nilai: number | null;
}

interface MataKuliah {
    id: number;
    nama: string;
    kode: string;
    sks: number;
}

interface Kelas {
    id: number;
    nama_kelas: string;
    tahun_ajaran: string;
    semester: string;
    prodi: {
        id: number;
        nama: string;
        fakultas: {
            id: number;
            nama: string;
        };
    };
}

interface Props {
    kelas: Kelas;
    mahasiswa: Mahasiswa[];
    mata_kuliah: MataKuliah[];
    dosen: {
        id: number;
        nama: string;
        nidn: string;
    };
}

export default function KelasMahasiswa({ kelas, mahasiswa, mata_kuliah, dosen }: Props) {
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

    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'nim' | 'nama' | 'nilai'>('nim');

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('darkMode', String(darkMode));
    }, [darkMode]);

    // Filter dan sort mahasiswa
    const filteredMahasiswa = mahasiswa
        .filter((mhs) => {
            const search = searchTerm.toLowerCase();
            return (
                mhs.nim.toLowerCase().includes(search) ||
                mhs.nama.toLowerCase().includes(search)
            );
        })
        .sort((a, b) => {
            if (sortBy === 'nim') return a.nim.localeCompare(b.nim);
            if (sortBy === 'nama') return a.nama.localeCompare(b.nama);
            if (sortBy === 'nilai') {
                const nilaiA = a.rata_rata_nilai || 0;
                const nilaiB = b.rata_rata_nilai || 0;
                return nilaiB - nilaiA;
            }
            return 0;
        });

    const getPersentaseColor = (persentase: number) => {
        if (persentase >= 80) return 'text-green-600 dark:text-green-400';
        if (persentase >= 60) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    const getNilaiColor = (nilai: number | null) => {
        if (nilai === null) return 'text-gray-500 dark:text-gray-400';
        if (nilai >= 80) return 'text-green-600 dark:text-green-400';
        if (nilai >= 60) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    const getGrade = (nilai: number | null) => {
        if (nilai === null) return '-';
        if (nilai >= 85) return 'A';
        if (nilai >= 70) return 'B';
        if (nilai >= 60) return 'C';
        if (nilai >= 50) return 'D';
        return 'E';
    };

    return (
        <div className={darkMode ? 'dark' : ''}>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
                <Head title={`Mahasiswa ${kelas.nama_kelas}`} />

                <DosenSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeMenu="kelas" />

                <div className={`p-4 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
                    <Header
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                        darkMode={darkMode}
                        setDarkMode={setDarkMode}
                        title={`Mahasiswa ${kelas.nama_kelas}`}
                        subtitle={`${kelas.prodi.nama} - ${kelas.tahun_ajaran} ${kelas.semester}`}
                    />

                    {/* Back Button */}
                    <div className="mb-4">
                        <Link
                            href={route('dosen.kelas.index')}
                            className="inline-flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Kembali ke Daftar Kelas
                        </Link>
                    </div>

                    {/* Kelas Info Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Kelas</p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">{kelas.nama_kelas}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Prodi</p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">{kelas.prodi.nama}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Tahun Ajaran</p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">{kelas.tahun_ajaran} {kelas.semester}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total Mahasiswa</p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">{mahasiswa.length} orang</p>
                            </div>
                        </div>

                        {/* Mata Kuliah */}
                        {mata_kuliah.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Mata Kuliah yang Diajar:</p>
                                <div className="flex flex-wrap gap-2">
                                    {mata_kuliah.map((mk) => (
                                        <span
                                            key={mk.id}
                                            className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm font-medium"
                                        >
                                            {mk.kode} - {mk.nama} ({mk.sks} SKS)
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Search and Filter */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Cari mahasiswa (NIM atau Nama)..."
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <div className="flex gap-2">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as 'nim' | 'nama' | 'nilai')}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="nim">Urutkan: NIM</option>
                                    <option value="nama">Urutkan: Nama</option>
                                    <option value="nilai">Urutkan: Nilai</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-blue-500 rounded-lg p-3">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Laki-laki</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {mahasiswa.filter(m => m.jenis_kelamin === 'L').length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-pink-500 rounded-lg p-3">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Perempuan</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {mahasiswa.filter(m => m.jenis_kelamin === 'P').length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-green-500 rounded-lg p-3">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Rata-rata Kehadiran</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {mahasiswa.length > 0
                                            ? Math.round(mahasiswa.reduce((sum, m) => sum + m.statistik_absensi.persentase, 0) / mahasiswa.length)
                                            : 0}%
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mahasiswa List */}
                    {filteredMahasiswa.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Tidak ada mahasiswa</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {searchTerm ? 'Tidak ada mahasiswa yang sesuai dengan pencarian.' : 'Belum ada mahasiswa di kelas ini.'}
                            </p>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-750">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                No
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                NIM
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Nama Mahasiswa
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                JK
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Angkatan
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Kehadiran
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Rata-rata Nilai
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {filteredMahasiswa.map((mhs, index) => (
                                            <tr key={mhs.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                                                    {index + 1}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {mhs.nim}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {mhs.nama}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {mhs.user.email}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                                                    {mhs.jenis_kelamin}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                                                    {mhs.angkatan}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className={`text-sm font-semibold ${getPersentaseColor(mhs.statistik_absensi.persentase)}`}>
                                                        {mhs.statistik_absensi.persentase}%
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {mhs.statistik_absensi.hadir}/{mhs.statistik_absensi.total} hadir
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className={`text-sm font-semibold ${getNilaiColor(mhs.rata_rata_nilai)}`}>
                                                        {mhs.rata_rata_nilai !== null ? mhs.rata_rata_nilai.toFixed(2) : '-'}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        Grade: {getGrade(mhs.rata_rata_nilai)}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
