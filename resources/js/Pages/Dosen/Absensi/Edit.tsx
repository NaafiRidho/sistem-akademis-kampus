import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import DosenSidebar from '@/Components/Layout/DosenSidebar';
import Header from '@/Components/Layout/Header';

interface Mahasiswa {
    id: number;
    nim: string;
    nama: string;
}

interface Jadwal {
    mata_kuliah: string;
    kelas: string;
}

interface Absensi {
    id: number;
    tanggal: string;
    status: string;
    keterangan: string | null;
    mahasiswa: Mahasiswa;
    jadwal: Jadwal;
}

interface Props {
    absensi: Absensi;
}

export default function AbsensiEdit({ absensi }: Props) {
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
    const [formData, setFormData] = useState({
        status: absensi.status,
        keterangan: absensi.keterangan || '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('darkMode', String(darkMode));
    }, [darkMode]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.put(`/dosen/absensi/${absensi.id}`, formData, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmitting(false);
            },
            onError: () => {
                setIsSubmitting(false);
            },
        });
    };

    return (
        <div className={darkMode ? 'dark' : ''}>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
                <Head title="Edit Absensi" />

                <DosenSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeMenu="absensi" />

                <div className={`p-4 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
                    <Header
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                        darkMode={darkMode}
                        setDarkMode={setDarkMode}
                        title="Edit Absensi"
                        subtitle="Edit data kehadiran mahasiswa"
                    />

                    <div className="mt-6 max-w-4xl mx-auto">
                        {/* Header */}
                        <div className="mb-6">
                            <button
                                onClick={() => router.get('/dosen/absensi')}
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4 flex items-center gap-2 text-sm font-medium"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Kembali ke Daftar Absensi
                            </button>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                ✏️ Edit Absensi
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Perbarui status kehadiran dan keterangan mahasiswa
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
                            {/* Info Mahasiswa - Prominent */}
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 border-b-2 border-gray-200 dark:border-gray-700">
                                <h3 className="text-base font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Informasi Absensi
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">👤 Mahasiswa</p>
                                        <p className="text-base font-bold text-gray-900 dark:text-white">{absensi.mahasiswa.nama}</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{absensi.mahasiswa.nim}</p>
                                    </div>
                                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">📚 Mata Kuliah</p>
                                        <p className="text-base font-bold text-gray-900 dark:text-white">{absensi.jadwal.mata_kuliah}</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Kelas: {absensi.jadwal.kelas}</p>
                                    </div>
                                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">📅 Tanggal</p>
                                        <p className="text-base font-bold text-gray-900 dark:text-white">
                                            {new Date(absensi.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                            {new Date(absensi.tanggal).toLocaleDateString('id-ID', { weekday: 'long' })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Status - Bigger Buttons */}
                                <div>
                                    <label className="block text-base font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Status Kehadiran <span className="text-red-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, status: 'Hadir' })}
                                            className={`p-4 rounded-xl font-bold text-center transition-all transform hover:scale-105 ${
                                                formData.status === 'Hadir'
                                                    ? 'bg-green-600 text-white shadow-lg ring-4 ring-green-200 dark:ring-green-900'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-green-900/20'
                                            }`}
                                        >
                                            <div className="text-2xl mb-1">✅</div>
                                            <div className="text-sm">Hadir</div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, status: 'Izin' })}
                                            className={`p-4 rounded-xl font-bold text-center transition-all transform hover:scale-105 ${
                                                formData.status === 'Izin'
                                                    ? 'bg-blue-600 text-white shadow-lg ring-4 ring-blue-200 dark:ring-blue-900'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/20'
                                            }`}
                                        >
                                            <div className="text-2xl mb-1">📝</div>
                                            <div className="text-sm">Izin</div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, status: 'Sakit' })}
                                            className={`p-4 rounded-xl font-bold text-center transition-all transform hover:scale-105 ${
                                                formData.status === 'Sakit'
                                                    ? 'bg-yellow-600 text-white shadow-lg ring-4 ring-yellow-200 dark:ring-yellow-900'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/20'
                                            }`}
                                        >
                                            <div className="text-2xl mb-1">🏥</div>
                                            <div className="text-sm">Sakit</div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, status: 'Alpa' })}
                                            className={`p-4 rounded-xl font-bold text-center transition-all transform hover:scale-105 ${
                                                formData.status === 'Alpa'
                                                    ? 'bg-red-600 text-white shadow-lg ring-4 ring-red-200 dark:ring-red-900'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900/20'
                                            }`}
                                        >
                                            <div className="text-2xl mb-1">❌</div>
                                            <div className="text-sm">Alpa</div>
                                        </button>
                                    </div>
                                </div>

                                {/* Keterangan */}
                                <div>
                                    <label className="block text-base font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                        </svg>
                                        Keterangan Tambahan
                                    </label>
                                    <textarea
                                        value={formData.keterangan}
                                        onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                                        rows={4}
                                        placeholder="Tambahkan catatan atau keterangan jika diperlukan (opsional)..."
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white placeholder-gray-400"
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                        Contoh: "Terlambat 15 menit", "Izin sakit dengan surat dokter", dll.
                                    </p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="px-6 py-5 bg-gray-50 dark:bg-gray-750 border-t-2 border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                <button
                                    type="button"
                                    onClick={() => router.get('/dosen/absensi')}
                                    className="px-6 py-2.5 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 shadow-md flex items-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Simpan Perubahan
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
