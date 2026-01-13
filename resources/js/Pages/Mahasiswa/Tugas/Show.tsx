import { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import MahasiswaSidebar from '@/Components/Layout/MahasiswaSidebar';
import Header from '@/Components/Layout/Header';
import Toast from '@/Components/Toast';

interface MataKuliah {
    id: number;
    nama_mk: string;
    kode_mk: string;
}

interface Dosen {
    id: number;
    nama: string;
}

interface Pengumpulan {
    id: number;
    nilai: number | null;
    catatan: string | null;
    file_path: string;
    tanggal_pengumpulan: string;
    status: string;
}

interface Tugas {
    id: number;
    judul: string;
    deskripsi: string;
    deadline: string;
    file_path: string | null;
    created_at: string;
    mata_kuliah: MataKuliah;
    dosen: Dosen;
    pengumpulan: Pengumpulan | null;
    is_terlambat: boolean;
}

interface Mahasiswa {
    id: number;
    nim: string;
    nama: string;
}

interface Props {
    mahasiswa: Mahasiswa;
    tugas: Tugas;
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function TugasShow({ tugas, flash }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        file: null as File | null,
        catatan: '',
    });

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

    useEffect(() => {
        if (flash?.success) {
            setToast({ message: flash.success, type: 'success' });
        } else if (flash?.error) {
            setToast({ message: flash.error, type: 'error' });
        }
    }, [flash]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        post(`/mahasiswa/tugas/${tugas.id}/submit`, {
            onSuccess: () => {
                setShowSubmitModal(false);
                setData({ file: null, catatan: '' });
            },
        });
    };

    const handleDownloadTugas = () => {
        window.location.href = `/mahasiswa/tugas/${tugas.id}/download`;
    };

    const handleDownloadPengumpulan = () => {
        if (tugas.pengumpulan) {
            window.location.href = `/mahasiswa/tugas/pengumpulan/${tugas.pengumpulan.id}/download`;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const isOverdue = new Date(tugas.deadline) < new Date();
    const canSubmit = !tugas.pengumpulan && !isOverdue;

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
            <Head title={tugas.judul} />

            <MahasiswaSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeMenu="tugas" />

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <div className={`p-4 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
                <Header
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    darkMode={darkMode}
                    setDarkMode={setDarkMode}
                    title={tugas.judul}
                    subtitle={`${tugas.mata_kuliah.kode_mk} - ${tugas.mata_kuliah.nama_mk}`}
                />

                <div className="space-y-6">
                    {/* Back Button */}
                    <Link
                        href="/mahasiswa/tugas"
                        className="inline-flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Kembali
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Detail Tugas */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Info Tugas */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                                    Detail Tugas
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            Deskripsi
                                        </label>
                                        <p className="text-gray-800 dark:text-white mt-1 whitespace-pre-wrap">
                                            {tugas.deskripsi}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                Dosen Pengampu
                                            </label>
                                            <p className="text-gray-800 dark:text-white mt-1">
                                                {tugas.dosen.nama}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                Tanggal Dibuat
                                            </label>
                                            <p className="text-gray-800 dark:text-white mt-1">
                                                {formatDate(tugas.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                    {tugas.file_path && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                                                File Tugas
                                            </label>
                                            <button
                                                onClick={handleDownloadTugas}
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center"
                                            >
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                                Download File Tugas
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Status Pengumpulan */}
                            {tugas.pengumpulan && (
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                                        Status Pengumpulan
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                                            <div className="flex items-center mb-2">
                                                <svg className="w-6 h-6 text-green-600 dark:text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="font-semibold text-green-800 dark:text-green-300">
                                                    Tugas Sudah Dikumpulkan
                                                </span>
                                            </div>
                                            <p className="text-sm text-green-700 dark:text-green-400">
                                                Dikumpulkan pada: {formatDate(tugas.pengumpulan.tanggal_pengumpulan)}
                                            </p>
                                            <p className="text-sm text-green-700 dark:text-green-400">
                                                Status: {tugas.pengumpulan.status}
                                            </p>
                                        </div>

                                        {tugas.pengumpulan.catatan && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                    Catatan Anda
                                                </label>
                                                <p className="text-gray-800 dark:text-white mt-1 whitespace-pre-wrap bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                                    {tugas.pengumpulan.catatan}
                                                </p>
                                            </div>
                                        )}

                                        {tugas.pengumpulan.nilai !== null ? (
                                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                                <label className="text-sm font-medium text-blue-800 dark:text-blue-300">
                                                    Nilai
                                                </label>
                                                <p className="text-3xl font-bold text-blue-800 dark:text-blue-300 mt-1">
                                                    {tugas.pengumpulan.nilai}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                                                    ⏳ Tugas Anda sedang dinilai oleh dosen
                                                </p>
                                            </div>
                                        )}

                                        <button
                                            onClick={handleDownloadPengumpulan}
                                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition flex items-center"
                                        >
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                            Download File Pengumpulan
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar - Deadline & Action */}
                        <div className="space-y-6">
                            {/* Deadline Card */}
                            <div className={`rounded-xl shadow-sm border p-6 ${
                                isOverdue
                                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                            }`}>
                                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                                    Deadline
                                </h3>
                                <div className="text-center">
                                    <svg className={`w-16 h-16 mx-auto mb-4 ${
                                        isOverdue
                                            ? 'text-red-600 dark:text-red-400'
                                            : 'text-green-600 dark:text-green-400'
                                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className={`text-2xl font-bold mb-2 ${
                                        isOverdue
                                            ? 'text-red-800 dark:text-red-300'
                                            : 'text-gray-800 dark:text-white'
                                    }`}>
                                        {formatDate(tugas.deadline)}
                                    </p>
                                    {isOverdue && !tugas.pengumpulan && (
                                        <p className="text-red-700 dark:text-red-400 text-sm font-semibold">
                                            ⚠ Deadline sudah terlewat
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Action Card */}
                            {!tugas.pengumpulan && (
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                                        Kumpulkan Tugas
                                    </h3>
                                    {canSubmit ? (
                                        <button
                                            onClick={() => setShowSubmitModal(true)}
                                            className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-semibold"
                                        >
                                            📤 Kumpulkan Tugas
                                        </button>
                                    ) : (
                                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                                {isOverdue
                                                    ? 'Deadline sudah terlewat'
                                                    : 'Tugas sudah dikumpulkan'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Submit Modal */}
            {showSubmitModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                                Kumpulkan Tugas
                            </h3>
                            <button
                                onClick={() => setShowSubmitModal(false)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Upload File <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="file"
                                    onChange={(e) => setData('file', e.target.files?.[0] || null)}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                                    required
                                />
                                {errors.file && (
                                    <p className="text-red-600 text-sm mt-1">{errors.file}</p>
                                )}
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Maksimal 10MB
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Catatan (Opsional)
                                </label>
                                <textarea
                                    value={data.catatan}
                                    onChange={(e) => setData('catatan', e.target.value)}
                                    rows={4}
                                    placeholder="Tambahkan catatan untuk dosen..."
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-semibold disabled:opacity-50"
                                >
                                    {processing ? 'Mengirim...' : 'Kumpulkan'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowSubmitModal(false)}
                                    className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition"
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
