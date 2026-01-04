import { useState, useEffect } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import Sidebar from '@/Components/Layout/Sidebar';
import Header from '@/Components/Layout/Header';
import MataKuliahFormModal from '@/Components/Modals/MataKuliahFormModal';
import DeleteConfirmationModal from '@/Components/Modals/DeleteConfirmationModal';
import ImportModal from '@/Components/Modals/ImportModal';
import Toast from '@/Components/Toast';

interface MataKuliah {
    id: number;
    kode_mk: string;
    nama_mk: string;
    sks: number;
    prodi_id: number;
    prodi: {
        nama_prodi: string;
        fakultas: {
            nama_fakultas: string;
        };
    };
    jadwal?: Array<{
        dosen: {
            nama: string;
        };
        kelas: {
            nama_kelas: string;
        };
    }>;
}

interface Prodi {
    id: number;
    nama_prodi: string;
    fakultas: {
        nama_fakultas: string;
    };
}

interface Props {
    mataKuliah: {
        data: MataKuliah[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    prodi: Prodi[];
    flash: {
        success?: string;
        error?: string;
    };
}

export default function Index({ mataKuliah, prodi, flash }: Props) {
    console.log('MataKuliah Index loaded', { mataKuliah, prodi });
    
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
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedMataKuliah, setSelectedMataKuliah] = useState<MataKuliah | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterProdi, setFilterProdi] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        kode_mk: '',
        nama_mk: '',
        sks: '',
        prodi_id: ''
    });

    const showToastMessage = (message: string, type: 'success' | 'error') => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);
    };

    // Handle flash messages
    useEffect(() => {
        if (flash?.success) {
            showToastMessage(flash.success, 'success');
        }
        if (flash?.error) {
            showToastMessage(flash.error, 'error');
        }
    }, [flash]);

    const handleCreate = () => {
        setModalMode('create');
        setFormData({
            kode_mk: '',
            nama_mk: '',
            sks: '',
            prodi_id: ''
        });
        setShowModal(true);
    };

    const handleEdit = (item: MataKuliah) => {
        setModalMode('edit');
        setSelectedMataKuliah(item);
        setFormData({
            kode_mk: item.kode_mk,
            nama_mk: item.nama_mk,
            sks: item.sks.toString(),
            prodi_id: item.prodi_id.toString()
        });
        setShowModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        if (modalMode === 'create') {
            console.log('Creating mata kuliah:', formData);
            router.post('/admin/matakuliah', formData, {
                preserveScroll: true,
                onSuccess: (page) => {
                    console.log('Create success', page);
                    setShowModal(false);
                    setFormData({
                        kode_mk: '',
                        nama_mk: '',
                        sks: '',
                        prodi_id: ''
                    });
                },
                onError: (errors) => {
                    console.error('Create error:', errors);
                    setShowModal(false);
                    
                    // Tampilkan notifikasi error
                    const errorMessages = Object.values(errors).flat();
                    const errorMessage = errorMessages.length > 0 
                        ? errorMessages.join(', ') 
                        : 'Gagal menambahkan data mata kuliah';
                    showToastMessage(errorMessage, 'error');
                },
                onFinish: () => {
                    console.log('Create finished');
                    setLoading(false);
                }
            });
        } else if (selectedMataKuliah) {
            console.log('Updating mata kuliah:', selectedMataKuliah.id, formData);
            router.post(`/admin/matakuliah/${selectedMataKuliah.id}`, {
                ...formData,
                _method: 'PUT'
            }, {
                preserveScroll: true,
                onSuccess: (page) => {
                    console.log('Update success', page);
                    setShowModal(false);
                    setSelectedMataKuliah(null);
                },
                onError: (errors) => {
                    console.error('Update error:', errors);
                    setShowModal(false);
                    setSelectedMataKuliah(null);
                    
                    // Tampilkan notifikasi error
                    const errorMessages = Object.values(errors).flat();
                    const errorMessage = errorMessages.length > 0 
                        ? errorMessages.join(', ') 
                        : 'Gagal memperbarui data mata kuliah';
                    showToastMessage(errorMessage, 'error');
                },
                onFinish: () => {
                    console.log('Update finished');
                    setLoading(false);
                }
            });
        }
    };

    const handleDelete = (item: MataKuliah) => {
        setSelectedMataKuliah(item);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (selectedMataKuliah) {
            setLoading(true);
            console.log('Deleting mata kuliah:', selectedMataKuliah.id);
            router.delete(`/admin/matakuliah/${selectedMataKuliah.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    console.log('Delete success');
                    setShowDeleteModal(false);
                    setSelectedMataKuliah(null);
                },
                onError: (errors) => {
                    console.error('Delete error:', errors);
                    setShowDeleteModal(false);
                    setSelectedMataKuliah(null);
                    
                    // Tampilkan notifikasi error
                    const errorMessages = Object.values(errors).flat();
                    const errorMessage = errorMessages.length > 0 
                        ? errorMessages.join(', ') 
                        : 'Gagal menghapus data mata kuliah';
                    showToastMessage(errorMessage, 'error');
                },
                onFinish: () => {
                    setLoading(false);
                }
            });
        }
    };

    const handleImport = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!importFile) {
            alert('Silakan pilih file terlebih dahulu');
            return;
        }
        
        const formData = new FormData();
        formData.append('file', importFile);
        
        router.post('/admin/matakuliah/import', formData, {
            onSuccess: (page) => {
                console.log('Import success:', page.props.flash);
                setShowImportModal(false);
                setImportFile(null);
            },
            onError: (errors) => {
                console.log('Import errors:', errors);
            }
        });
    };

    const filteredMataKuliah = mataKuliah.data.filter(item => {
        const matchSearch = item.nama_mk.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.kode_mk.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.prodi.nama_prodi.toLowerCase().includes(searchTerm.toLowerCase());
        const matchProdi = filterProdi === '' || item.prodi_id.toString() === filterProdi;
        return matchSearch && matchProdi;
    });

    useEffect(() => {
        console.log('MataKuliah useEffect running', { darkMode });
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('darkMode', String(darkMode));
    }, [darkMode]);

    console.log('About to render, showModal:', showModal);

    return (
        <div className={darkMode ? 'dark' : ''} style={{ minHeight: '100vh', backgroundColor: darkMode ? '#111827' : '#f3f4f6' }}>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
                <Head title="Mata Kuliah" />
                <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeMenu="matakuliah" />

                <div className={`p-4 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
                    <h1 style={{ color: 'white', fontSize: '24px', padding: '20px' }}>MATA KULIAH PAGE TEST</h1>
                    <Header
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                        darkMode={darkMode}
                        setDarkMode={setDarkMode}
                        title="Mata Kuliah"
                        subtitle="Kelola data mata kuliah"
                    />

                    <div className="space-y-6">
                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 justify-end">
                            <button
                                onClick={() => setShowImportModal(true)}
                                className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                Import Excel
                            </button>
                            <button
                                onClick={handleCreate}
                                className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Tambah Mata Kuliah
                            </button>
                        </div>

                        {/* Search & Filter */}
                        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center mb-4">
                                <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pencarian & Filter</h3>
                            </div>
                            <div className="flex flex-col md:flex-row gap-3">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        placeholder="Cari kode, nama mata kuliah, prodi..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full px-4 py-3 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <select
                                        value={filterProdi}
                                        onChange={(e) => setFilterProdi(e.target.value)}
                                        className="px-4 py-3 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="">Semua Prodi</option>
                                        {prodi.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.nama_prodi}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">No</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Kode MK</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nama Mata Kuliah</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">SKS</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Prodi</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                        {filteredMataKuliah.length > 0 ? (
                                            filteredMataKuliah.map((item, index) => (
                                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                                                        {index + 1}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-300">
                                                        {item.kode_mk}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                                                        {item.nama_mk}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 dark:text-gray-300">
                                                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                            {item.sks} SKS
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                                                        <div>
                                                            <div className="font-medium">{item.prodi.nama_prodi}</div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">{item.prodi.fakultas.nama_fakultas}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                        <div className="flex justify-center gap-2">
                                                            <button
                                                                onClick={() => handleEdit(item)}
                                                                className="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/30 rounded-lg shadow-md hover:shadow-lg transform hover:scale-110 transition-all duration-200"
                                                                title="Edit"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(item)}
                                                                className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/30 rounded-lg shadow-md hover:shadow-lg transform hover:scale-110 transition-all duration-200"
                                                                title="Hapus"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                                                    Tidak ada data mata kuliah
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {mataKuliah.links && mataKuliah.links.length > 3 && (
                                <div className="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6">
                                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                        <div className="text-sm text-gray-700 dark:text-gray-300">
                                            Menampilkan <span className="font-semibold">{mataKuliah.from || 0}</span> - <span className="font-semibold">{mataKuliah.to || 0}</span> dari <span className="font-semibold">{mataKuliah.total}</span> data
                                        </div>
                                        <div className="flex flex-wrap gap-2 justify-center">
                                            {mataKuliah.links.map((link: any, index: number) => (
                                                link.url ? (
                                                    <Link
                                                        key={index}
                                                        href={link.url}
                                                        preserveScroll
                                                        className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                                                            link.active
                                                                ? 'bg-indigo-600 text-white font-semibold shadow-md'
                                                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'
                                                        }`}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                ) : (
                                                    <span
                                                        key={index}
                                                        className="px-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-600 cursor-not-allowed"
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                )
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showModal && (
                <MataKuliahFormModal
                    show={showModal}
                    onClose={() => setShowModal(false)}
                    onSubmit={handleSubmit}
                    formData={formData}
                    setFormData={setFormData}
                    prodi={prodi}
                    isEdit={modalMode === 'edit'}
                    isLoading={loading}
                />
            )}

            <DeleteConfirmationModal
                show={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Hapus Mata Kuliah"
                message={`Apakah Anda yakin ingin menghapus mata kuliah "${selectedMataKuliah?.nama_mk}"?`}
                itemName={selectedMataKuliah?.kode_mk || ''}
                isLoading={loading}
            />

            <ImportModal
                show={showImportModal}
                onClose={() => {
                    setShowImportModal(false);
                    setImportFile(null);
                }}
                onSubmit={handleImport}
                file={importFile}
                setFile={setImportFile}
                templateUrl="/admin/matakuliah/template/download"
                entityName="Mata Kuliah"
                isLoading={loading}
            />

            {showToast && (
                <Toast
                    message={toastMessage}
                    type={toastType}
                    onClose={() => setShowToast(false)}
                />
            )}

            {/* Loading Overlay */}
            {loading && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 flex flex-col items-center space-y-4">
                        {/* Spinner */}
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
                            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        
                        {/* Text */}
                        <div className="text-center">
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                Memproses...
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Mohon tunggu sebentar
                            </p>
                        </div>

                        {/* Progress Text */}
                        <div className="text-xs font-medium text-gray-600 dark:text-gray-300">
                            0%
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
