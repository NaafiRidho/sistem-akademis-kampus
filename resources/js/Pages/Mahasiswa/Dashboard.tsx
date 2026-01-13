import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import MahasiswaSidebar from '@/Components/Layout/MahasiswaSidebar';
import Header from '@/Components/Layout/Header';

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
    prodi: Prodi;
}

interface Mahasiswa {
    id: number;
    nim: string;
    nama: string;
    email: string;
    prodi: Prodi;
    kelas: Kelas;
    angkatan: string;
}

interface MataKuliah {
    id: number;
    nama_mk: string;
    kode_mk: string;
}

interface Dosen {
    id: number;
    nama: string;
}

interface Jadwal {
    id: number;
    hari: string;
    jam_mulai: string;
    jam_selesai: string;
    ruangan: string;
    mata_kuliah: MataKuliah;
    dosen: Dosen;
}

interface Tugas {
    id: number;
    judul: string;
    deadline: string;
    mata_kuliah: MataKuliah;
    dosen: Dosen;
}

interface Stats {
    persentase_kehadiran: number;
    total_absensi: number;
    hadir: number;
    sakit: number;
    izin: number;
    alpha: number;
    nilai_tertinggi: number;
    nilai_terendah: number;
    rata_rata_nilai: number;
    total_mata_kuliah: number;
    total_tugas: number;
    tugas_dinilai: number;
    tugas_belum_dinilai: number;
}

interface Props {
    mahasiswa: Mahasiswa;
    jadwalHariIni: Jadwal[];
    tugasAktif: Tugas[];
    stats: Stats;
}

export default function Dashboard({ mahasiswa, jadwalHariIni, tugasAktif, stats }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

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

    const formatTime = (time: string) => {
        return time.substring(0, 5);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const isDeadlineSoon = (deadline: string) => {
        const deadlineDate = new Date(deadline);
        const now = new Date();
        const diffTime = deadlineDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 3 && diffDays > 0;
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
            <Head title="Dashboard Mahasiswa" />

            <MahasiswaSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeMenu="dashboard" />

            <div className={`p-4 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
                <Header
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    darkMode={darkMode}
                    setDarkMode={setDarkMode}
                    title={`Selamat Datang, ${mahasiswa.nama}`}
                    subtitle={`${mahasiswa.nim} - ${mahasiswa.prodi.nama}`}
                />

                <div className="space-y-6">
                    {/* Profile Card */}
                    <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
                        <div className="flex items-center space-x-4">
                            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">{mahasiswa.nama}</h2>
                                <p className="text-white/90">{mahasiswa.nim}</p>
                                <p className="text-white/80 text-sm">{mahasiswa.kelas.nama_kelas} - {mahasiswa.prodi.nama}</p>
                                <p className="text-white/80 text-sm">Angkatan {mahasiswa.angkatan}</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Kehadiran */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Kehadiran</p>
                                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.persentase_kehadiran}%</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {stats.hadir} dari {stats.total_absensi} pertemuan
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Rata-rata Nilai */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Rata-rata Nilai</p>
                                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.rata_rata_nilai}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {stats.total_mata_kuliah} mata kuliah
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Tugas */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Tugas</p>
                                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.total_tugas}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {stats.tugas_dinilai} sudah dinilai
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Tugas Aktif */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tugas Aktif</p>
                                    <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{tugasAktif.length}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Belum dikumpulkan
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Jadwal Hari Ini & Tugas Aktif */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Jadwal Hari Ini */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Jadwal Hari Ini</h3>
                            </div>
                            <div className="p-6">
                                {jadwalHariIni.length > 0 ? (
                                    <div className="space-y-3">
                                        {jadwalHariIni.map((jadwal) => (
                                            <div key={jadwal.id} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                                <div className="w-16 flex-shrink-0">
                                                    <p className="text-xs font-semibold text-green-600 dark:text-green-400">
                                                        {formatTime(jadwal.jam_mulai)}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {formatTime(jadwal.jam_selesai)}
                                                    </p>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-800 dark:text-white text-sm">
                                                        {jadwal.mata_kuliah.nama_mk}
                                                    </p>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                                        {jadwal.dosen.nama}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        📍 {jadwal.ruangan}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <svg className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-gray-500 dark:text-gray-400">Tidak ada jadwal hari ini</p>
                                    </div>
                                )}
                            </div>
                            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                                <Link
                                    href="/mahasiswa/jadwal"
                                    className="text-sm text-green-600 dark:text-green-400 hover:underline font-medium"
                                >
                                    Lihat Semua Jadwal →
                                </Link>
                            </div>
                        </div>

                        {/* Tugas Aktif */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Tugas Belum Dikumpulkan</h3>
                            </div>
                            <div className="p-6">
                                {tugasAktif.length > 0 ? (
                                    <div className="space-y-3">
                                        {tugasAktif.map((tugas) => (
                                            <Link
                                                key={tugas.id}
                                                href={`/mahasiswa/tugas/${tugas.id}`}
                                                className="block p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-gray-800 dark:text-white text-sm">
                                                            {tugas.judul}
                                                        </p>
                                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                            {tugas.mata_kuliah.nama_mk}
                                                        </p>
                                                    </div>
                                                    <span className={`text-xs px-2 py-1 rounded ${
                                                        isDeadlineSoon(tugas.deadline)
                                                            ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                                                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                                                    }`}>
                                                        {formatDate(tugas.deadline)}
                                                    </span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <svg className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-gray-500 dark:text-gray-400">Semua tugas sudah dikumpulkan! 🎉</p>
                                    </div>
                                )}
                            </div>
                            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                                <Link
                                    href="/mahasiswa/tugas"
                                    className="text-sm text-green-600 dark:text-green-400 hover:underline font-medium"
                                >
                                    Lihat Semua Tugas →
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
