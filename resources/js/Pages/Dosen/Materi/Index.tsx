import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import DosenSidebar from '@/Components/Layout/DosenSidebar';
import Header from '@/Components/Layout/Header';
import DeleteConfirmationModal from '@/Components/Modals/DeleteConfirmationModal';

interface MataKuliah {
    id: number;
    nama_mk: string;
    kode_mk: string;
    sks: number;
    kelas: string[];
}

interface Dosen {
    id: number;
    nama: string;
}

interface Materi {
    id: number;
    judul: string;
    file: string;
    created_at: string;
    mata_kuliah: MataKuliah;
    dosen: Dosen;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedMateri {
    data: Materi[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: PaginationLink[];
}

interface Props {
    materi: PaginatedMateri;
    mataKuliahList: MataKuliah[];
    filters: {
        mata_kuliah_id?: string;
        kelas?: string;
    };
}

export default function Index({ materi, mataKuliahList, filters }: Props) {
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
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [materiToDelete, setMateriToDelete] = useState<Materi | null>(null);
    const [selectedMataKuliah, setSelectedMataKuliah] = useState(filters?.mata_kuliah_id || '');
    const [selectedKelas, setSelectedKelas] = useState(filters?.kelas || '');
    const [availableKelas, setAvailableKelas] = useState<string[]>([]);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('darkMode', String(darkMode));
    }, [darkMode]);

    useEffect(() => {
        if (selectedMataKuliah) {
            const mk = mataKuliahList.find(m => m.id.toString() === selectedMataKuliah);
            setAvailableKelas(mk?.kelas || []);
        } else {
            // Get all unique kelas from all mata kuliah
            const allKelas = mataKuliahList.flatMap(mk => mk.kelas);
            setAvailableKelas([...new Set(allKelas)]);
        }
    }, [selectedMataKuliah, mataKuliahList]);

    const handleFilter = () => {
        router.get('/dosen/materi', {
            mata_kuliah_id: selectedMataKuliah || undefined,
            kelas: selectedKelas || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleResetFilter = () => {
        setSelectedMataKuliah('');
        setSelectedKelas('');
        router.get('/dosen/materi');
    };

    const handleDelete = (materiItem: Materi) => {
        setMateriToDelete(materiItem);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (materiToDelete) {
            router.delete(`/dosen/materi/${materiToDelete.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setDeleteModalOpen(false);
                    setMateriToDelete(null);
                },
            });
        }
    };

    const handleDownload = (id: number) => {
        window.location.href = `/dosen/materi/${id}/download`;
    };

    const getFileIcon = (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'pdf':
                return (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                );
            case 'ppt':
            case 'pptx':
                return (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                );
            case 'doc':
            case 'docx':
                return (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                );
        }
    };

    return (
        <div className={darkMode ? 'dark' : ''}>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
                <Head title="Materi Pembelajaran" />

                <DosenSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeMenu="materi" />

                <div className={`p-4 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
                    <Header
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                        darkMode={darkMode}
                        setDarkMode={setDarkMode}
                        title="Materi Pembelajaran"
                        subtitle="Upload dan kelola materi pembelajaran untuk mahasiswa"
                    />

                    {/* Action Bar */}
                    <div className="mb-6 flex justify-between items-center">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Total {materi.total} materi
                        </div>
                        <button
                            onClick={() => router.get('/dosen/materi/create')}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2.5 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2 shadow-lg"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Upload Materi</span>
                        </button>
                    </div>

                    {/* Filter Section */}
                    <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            {/* Filter Mata Kuliah */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Mata Kuliah
                                </label>
                                <select
                                    value={selectedMataKuliah}
                                    onChange={(e) => setSelectedMataKuliah(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Semua Mata Kuliah</option>
                                    {mataKuliahList.map((mk) => (
                                        <option key={mk.id} value={mk.id}>
                                            {mk.kode_mk} - {mk.nama_mk}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Filter Kelas */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Kelas
                                </label>
                                <select
                                    value={selectedKelas}
                                    onChange={(e) => setSelectedKelas(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    disabled={availableKelas.length === 0}
                                >
                                    <option value="">Semua Kelas</option>
                                    {availableKelas.map((kelas) => (
                                        <option key={kelas} value={kelas}>
                                            {kelas}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-2">
                                <button
                                    onClick={handleFilter}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                    </svg>
                                    <span>Filter</span>
                                </button>
                                <button
                                    onClick={handleResetFilter}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    title="Reset Filter"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Materi List */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                        {materi.data.length === 0 ? (
                            <div className="text-center py-16">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Belum ada materi</h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Mulai upload materi pembelajaran untuk mahasiswa.
                                </p>
                                <div className="mt-6">
                                    <button
                                        onClick={() => router.get('/dosen/materi/create')}
                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                    >
                                        <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Upload Materi
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Judul Materi
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Mata Kuliah
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                File
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Tanggal Upload
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {materi.data.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {item.judul}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900 dark:text-white">
                                                        {item.mata_kuliah.kode_mk}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {item.mata_kuliah.nama_mk}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center space-x-2">
                                                        <div className="text-gray-500 dark:text-gray-400">
                                                            {getFileIcon(item.file)}
                                                        </div>
                                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                                            {item.file.split('.').pop()?.toUpperCase()}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    {new Date(item.created_at).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end space-x-2">
                                                        <button
                                                            onClick={() => handleDownload(item.id)}
                                                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors"
                                                            title="Download"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(item)}
                                                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors"
                                                            title="Hapus"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination */}
                        {materi.data.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    <button
                                        onClick={() => materi.links[0].url && router.get(materi.links[0].url)}
                                        disabled={!materi.links[0].url}
                                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => {
                                            const lastLink = materi.links[materi.links.length - 1];
                                            if (lastLink.url) router.get(lastLink.url);
                                        }}
                                        disabled={!materi.links[materi.links.length - 1].url}
                                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            Menampilkan <span className="font-medium">{materi.data.length > 0 ? ((materi.current_page - 1) * materi.per_page) + 1 : 0}</span> sampai{' '}
                                            <span className="font-medium">{Math.min(materi.current_page * materi.per_page, materi.total)}</span> dari{' '}
                                            <span className="font-medium">{materi.total}</span> hasil
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                            {materi.links.map((link, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => link.url && router.get(link.url)}
                                                    disabled={!link.url}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                        link.active
                                                            ? 'z-10 bg-blue-600 border-blue-600 text-white'
                                                            : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                                                    } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''} ${
                                                        index === 0 ? 'rounded-l-md' : ''
                                                    } ${index === materi.links.length - 1 ? 'rounded-r-md' : ''}`}
                                                />
                                            ))}
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                show={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Hapus Materi?"
                message={`Apakah Anda yakin ingin menghapus materi "${materiToDelete?.judul || ''}"? Tindakan ini tidak dapat dibatalkan.`}
                itemName={materiToDelete?.judul || ''}
            />
        </div>
    );
}
