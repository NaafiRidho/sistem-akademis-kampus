import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import DosenSidebar from '@/Components/Layout/DosenSidebar';
import Header from '@/Components/Layout/Header';
import axios from 'axios';

interface JadwalItem {
    id: number;
    mata_kuliah: string;
    kelas: string;
    hari: string;
}

interface MahasiswaAbsensi {
    id: number;
    nim: string;
    nama: string;
    status: string | null;
    keterangan: string | null;
    absensi_id: number | null;
}

interface Props {
    jadwalList: JadwalItem[];
}

export default function AbsensiCreate({ jadwalList }: Props) {
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
    const [selectedJadwal, setSelectedJadwal] = useState('');
    const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
    const [mahasiswaList, setMahasiswaList] = useState<MahasiswaAbsensi[]>([]);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('darkMode', String(darkMode));
    }, [darkMode]);

    useEffect(() => {
        if (selectedJadwal && tanggal) {
            loadMahasiswa();
        }
    }, [selectedJadwal, tanggal]);

    const loadMahasiswa = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/dosen/absensi/mahasiswa', {
                params: {
                    jadwal_id: selectedJadwal,
                    tanggal: tanggal,
                }
            });
            setMahasiswaList(response.data.mahasiswa);
        } catch (error) {
            console.error('Error loading mahasiswa:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (mahasiswaId: number, status: string) => {
        setMahasiswaList(prev =>
            prev.map(mhs =>
                mhs.id === mahasiswaId ? { ...mhs, status } : mhs
            )
        );
    };

    const handleKeteranganChange = (mahasiswaId: number, keterangan: string) => {
        setMahasiswaList(prev =>
            prev.map(mhs =>
                mhs.id === mahasiswaId ? { ...mhs, keterangan } : mhs
            )
        );
    };

    const handleSetAllStatus = (status: string) => {
        setMahasiswaList(prev =>
            prev.map(mhs => ({ ...mhs, status }))
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedJadwal) {
            alert('Pilih jadwal terlebih dahulu');
            return;
        }

        const absensiData = mahasiswaList
            .filter(mhs => mhs.status)
            .map(mhs => ({
                mahasiswa_id: mhs.id,
                status: mhs.status,
                keterangan: mhs.keterangan || '',
            }));

        if (absensiData.length === 0) {
            alert('Harap isi status absensi minimal untuk 1 mahasiswa');
            return;
        }

        setIsSubmitting(true);

        router.post('/dosen/absensi', {
            jadwal_id: selectedJadwal,
            tanggal: tanggal,
            absensi: absensiData,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmitting(false);
            },
            onError: (errors) => {
                console.error('Error:', errors);
                setIsSubmitting(false);
            },
        });
    };

    const getStatusBadge = (status: string) => {
        const badges: Record<string, string> = {
            'Hadir': 'bg-green-500',
            'Izin': 'bg-blue-500',
            'Sakit': 'bg-yellow-500',
            'Alpa': 'bg-red-500',
        };
        return badges[status] || 'bg-gray-500';
    };

    return (
        <div className={darkMode ? 'dark' : ''}>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
                <Head title="Input Absensi" />

                <DosenSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeMenu="absensi" />

                <div className={`p-4 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
                    <Header
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                        darkMode={darkMode}
                        setDarkMode={setDarkMode}
                        title="Input Absensi"
                        subtitle="Input kehadiran mahasiswa untuk pertemuan kuliah"
                    />

                    <div className="mt-6 max-w-7xl mx-auto">
                        {/* Header dengan Step Indicator */}
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                ✏️ Input Absensi Mahasiswa
                            </h1>
                            
                            {/* Step Indicator */}
                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                                        1
                                    </div>
                                    <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">Pilih Jadwal</span>
                                </div>
                                <div className="flex-1 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
                                <div className="flex items-center">
                                    <div className={`w-8 h-8 rounded-full ${
                                        selectedJadwal && mahasiswaList.length > 0
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-300 dark:bg-gray-600 text-gray-500'
                                    } flex items-center justify-center font-bold text-sm`}>
                                        2
                                    </div>
                                    <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">Isi Kehadiran</span>
                                </div>
                                <div className="flex-1 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
                                <div className="flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 text-gray-500 flex items-center justify-center font-bold text-sm">
                                        3
                                    </div>
                                    <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">Simpan</span>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* Step 1: Card Form Selection */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6 border-2 border-blue-200 dark:border-blue-800">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                                        1
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Pilih Jadwal & Tanggal Pertemuan
                                    </h3>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 ml-10">
                                    Tentukan kelas dan tanggal pertemuan untuk input absensi
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-10">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            📚 Jadwal Kuliah <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={selectedJadwal}
                                            onChange={(e) => setSelectedJadwal(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all"
                                            required
                                        >
                                            <option value="">-- Pilih Mata Kuliah & Kelas --</option>
                                            {jadwalList.map((jadwal) => (
                                                <option key={jadwal.id} value={jadwal.id}>
                                                    {jadwal.mata_kuliah} - {jadwal.kelas} ({jadwal.hari})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            📅 Tanggal Pertemuan <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={tanggal}
                                            onChange={(e) => setTanggal(e.target.value)}
                                            max={new Date().toISOString().split('T')[0]}
                                            className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all"
                                            required
                                        />
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            Maksimal hari ini
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Step 2: Daftar Mahasiswa */}
                            {selectedJadwal && mahasiswaList.length > 0 && (
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border-2 border-green-200 dark:border-green-800">
                                    <div className="px-6 py-5 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-b border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                                                    2
                                                </div>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    Isi Status Kehadiran
                                                </h3>
                                            </div>
                                            <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-semibold">
                                                {mahasiswaList.length} Mahasiswa
                                            </span>
                                        </div>
                                        
                                        {/* Quick Action */}
                                        <div className="flex flex-wrap items-center gap-3">
                                            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">Set Semua:</p>
                                            <button
                                                type="button"
                                                onClick={() => handleSetAllStatus('Hadir')}
                                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors font-medium shadow-sm flex items-center gap-1.5"
                                            >
                                                <span>✅</span> Semua Hadir
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleSetAllStatus('Izin')}
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors font-medium shadow-sm flex items-center gap-1.5"
                                            >
                                                <span>📝</span> Semua Izin
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleSetAllStatus('Alpa')}
                                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors font-medium shadow-sm flex items-center gap-1.5"
                                            >
                                                <span>❌</span> Semua Alpa
                                            </button>
                                            <div className="ml-auto text-sm text-gray-600 dark:text-gray-400">
                                                Terisi: <span className="font-bold text-blue-600 dark:text-blue-400">{mahasiswaList.filter(m => m.status).length}</span> / {mahasiswaList.length}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full bg-white dark:bg-gray-800">
                                            <thead className="bg-gray-50 dark:bg-gray-700 border-b-2 border-gray-200 dark:border-gray-600">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase w-16">No</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase">Mahasiswa</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase">Status Kehadiran</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase">Keterangan (Opsional)</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                {mahasiswaList.map((mhs, index) => (
                                                    <tr key={mhs.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                                        <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                                                            {index + 1}
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                                                {mhs.nama}
                                                            </div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                {mhs.nim}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div className="flex flex-wrap gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleStatusChange(mhs.id, 'Hadir')}
                                                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                                                                        mhs.status === 'Hadir'
                                                                            ? 'bg-green-600 text-white shadow-md transform scale-105'
                                                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-green-900/20'
                                                                    }`}
                                                                >
                                                                    ✅ Hadir
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleStatusChange(mhs.id, 'Izin')}
                                                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                                                                        mhs.status === 'Izin'
                                                                            ? 'bg-blue-600 text-white shadow-md transform scale-105'
                                                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/20'
                                                                    }`}
                                                                >
                                                                    📝 Izin
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleStatusChange(mhs.id, 'Sakit')}
                                                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                                                                        mhs.status === 'Sakit'
                                                                            ? 'bg-yellow-600 text-white shadow-md transform scale-105'
                                                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/20'
                                                                    }`}
                                                                >
                                                                    🏥 Sakit
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleStatusChange(mhs.id, 'Alpa')}
                                                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                                                                        mhs.status === 'Alpa'
                                                                            ? 'bg-red-600 text-white shadow-md transform scale-105'
                                                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900/20'
                                                                    }`}
                                                                >
                                                                    ❌ Alpa
                                                                </button>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <input
                                                                type="text"
                                                                value={mhs.keterangan || ''}
                                                                onChange={(e) => handleKeteranganChange(mhs.id, e.target.value)}
                                                                placeholder="Catatan (jika ada)..."
                                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white placeholder-gray-400"
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="px-6 py-5 bg-gray-50 dark:bg-gray-750 border-t-2 border-gray-200 dark:border-gray-700">
                                        <div className="flex justify-between items-center">
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                {mahasiswaList.filter(m => m.status).length === 0 ? (
                                                    <span className="text-orange-600 dark:text-orange-400 font-medium">
                                                        ⚠️ Harap isi minimal 1 status mahasiswa
                                                    </span>
                                                ) : (
                                                    <span className="text-green-600 dark:text-green-400 font-medium">
                                                        ✓ Siap disimpan ({mahasiswaList.filter(m => m.status).length} mahasiswa terisi)
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => router.get('/dosen/absensi')}
                                                    className="px-6 py-2.5 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition-colors"
                                                >
                                                    Batal
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={isSubmitting || mahasiswaList.filter(m => m.status).length === 0}
                                                    className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center gap-2"
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
                                                            Simpan Absensi
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {loading && (
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 border-2 border-blue-200 dark:border-blue-800">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="relative">
                                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 dark:border-blue-800"></div>
                                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 absolute top-0 left-0"></div>
                                        </div>
                                        <p className="text-gray-700 dark:text-gray-300 mt-6 font-medium text-lg">Memuat Data Mahasiswa...</p>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Mohon tunggu sebentar</p>
                                    </div>
                                </div>
                            )}

                            {!loading && selectedJadwal && mahasiswaList.length === 0 && (
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 border-2 border-yellow-200 dark:border-yellow-800">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="bg-yellow-100 dark:bg-yellow-900/20 rounded-full p-6 mb-4">
                                            <svg className="w-16 h-16 text-yellow-600 dark:text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Tidak Ada Mahasiswa
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
                                            Kelas ini belum memiliki mahasiswa.<br/>
                                            Silakan pilih jadwal kelas lain.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
