import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import Sidebar from '@/Components/Layout/Sidebar';
import Header from '@/Components/Layout/Header';
import DosenFormModal from '@/Components/Modals/DosenFormModal';
import DeleteConfirmationModal from '@/Components/Modals/DeleteConfirmationModal';
import ImportModal from '@/Components/Modals/ImportModal';
import Toast from '@/Components/Toast';

interface Dosen {
    id: number;
    nidn: string;
    nama: string;
    email: string;
    no_telepon?: string;
    pendidikan_terakhir?: string;
    prodi_id?: number;
    prodi?: {
        id: number;
        nama_prodi: string;
        fakultas?: {
            nama_fakultas: string;
        };
    };
    user?: { email: string };
}

interface Prodi {
    id: number;
    nama_prodi: string;
    fakultas?: {
        nama_fakultas: string;
    };
}

interface PageProps {
    dosen: {
        data: Dosen[];
        links: any[];
        from: number;
        to: number;
        total: number;
    };
    prodis: Prodi[];
    filters: {
        search?: string;
    };
}

export default function DosenIndex({ dosen, prodis, filters }: PageProps) {
    const page = usePage();
    const props = page.props as any;
    const flash = props.flash as { success?: string; error?: string; import_errors?: string[] };
    
    const [showToast, setShowToast] = useState(false);
    const [toastConfig, setToastConfig] = useState<{ type: string; message: string; details: string[] }>({ 
        type: 'info', 
        message: '', 
        details: [] 
    });
    
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
    const [search, setSearch] = useState(filters.search || '');
    const [showImportModal, setShowImportModal] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedDosen, setSelectedDosen] = useState<Dosen | null>(null);
    const [formData, setFormData] = useState({
        nidn: '',
        nama: '',
        email: '',
        password: '',
        no_telepon: '',
        pendidikan_terakhir: '',
        prodi_id: ''
    });

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('darkMode', String(darkMode));
    }, [darkMode]);
    
    useEffect(() => {
        console.log('=== Dosen Flash Effect Triggered ===');
        console.log('Props in effect:', props);
        console.log('Flash in effect:', props?.flash);
        
        const flash = props?.flash;
        
        // Reset toast first
        setShowToast(false);
        
        setTimeout(() => {
            if (flash?.success) {
                console.log('Setting SUCCESS toast with message:', flash.success);
                setToastConfig({
                    type: 'success',
                    message: flash.success,
                    details: flash.import_errors || []
                });
                setShowToast(true);
                console.log('Toast state set to TRUE');
            } else if (flash?.error) {
                console.log('Setting ERROR toast with message:', flash.error);
                setToastConfig({
                    type: 'error',
                    message: flash.error,
                    details: flash.import_errors || []
                });
                setShowToast(true);
                console.log('Toast state set to TRUE');
            }
        }, 100);
    }, [props]);

    const resetFormData = () => ({
        nidn: '',
        nama: '',
        email: '',
        password: '',
        no_telepon: '',
        pendidikan_terakhir: '',
        prodi_id: ''
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/dosen', { search }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleDelete = (dsn: Dosen) => {
        setSelectedDosen(dsn);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (selectedDosen) {
            router.post(`/admin/dosen/${selectedDosen?.id}`, {
                _method: 'DELETE'
            }, {
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setSelectedDosen(null);
                }
            });
        }
    };

    const handleCreate = () => {
        setFormData(resetFormData());
        setShowCreateModal(true);
    };

    const handleEdit = (dsn: Dosen) => {
        setSelectedDosen(dsn);
        setFormData({
            nidn: dsn.nidn,
            nama: dsn.nama,
            email: dsn.user?.email || dsn.email || '',
            password: '',
            no_telepon: dsn.no_telepon || '',
            pendidikan_terakhir: dsn.pendidikan_terakhir || '',
            prodi_id: dsn.prodi_id?.toString() || ''
        });
        setShowEditModal(true);
    };

    const handleSubmitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/admin/dosen', formData, {
            onSuccess: () => {
                setShowCreateModal(false);
                setFormData(resetFormData());
            }
        });
    };

    const handleSubmitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(`/admin/dosen/${selectedDosen?.id}`, {
            ...formData,
            _method: 'PUT'
        }, {
            onSuccess: () => {
                setShowEditModal(false);
                setSelectedDosen(null);
            }
        });
    };

    const handleImport = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!importFile) {
            alert('Silakan pilih file terlebih dahulu');
            return;
        }
        
        console.log('Importing file:', importFile);
        console.log('File type:', importFile.type);
        console.log('File name:', importFile.name);
        
        const formData = new FormData();
        formData.append('file', importFile, importFile.name);
        
        console.log('FormData created, posting to server...');

        router.post('/admin/dosen/import', formData, {
            forceFormData: true,
            preserveState: false,
            preserveScroll: false,
            onSuccess: (page) => {
                console.log('Import success:', page.props.flash);
                setShowImportModal(false);
                setImportFile(null);
            },
            onError: (errors) => {
                console.log('Import errors:', errors);
            },
        });
    };

    return (
        <div className={darkMode ? 'dark' : ''}>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
                <Head title="Data Dosen" />

                <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeMenu="dosen" />

                <div className={`p-4 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
                    <Header
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                        darkMode={darkMode}
                        setDarkMode={setDarkMode}
                        title="Data Dosen"
                        subtitle="Kelola data dosen"
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
                                Tambah Dosen
                            </button>
                        </div>

                        {/* Flash Messages - Now handled by Toast */}
                        {/* Keeping this for backward compatibility but Toast is preferred */}

                        {/* Search */}
                        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center mb-4">
                                <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pencarian Data</h3>
                            </div>
                            <form onSubmit={handleSearch} className="flex gap-3">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        placeholder="Cari NIDN atau Nama..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full px-4 py-3 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <button
                                        type="submit"
                                        className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white px-6 py-3 text-base font-semibold rounded-lg transition-colors"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        Cari
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Table */}
                        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            NIDN
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Nama
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            No. Telepon
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Pendidikan
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Prodi Mengajar
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {dosen.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                                Tidak ada data dosen
                                            </td>
                                        </tr>
                                    ) : (
                                        dosen.data.map((dsn: Dosen) => (
                                            <tr key={dsn.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                    {dsn.nidn}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                    {dsn.nama}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                    {dsn.email}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                    {dsn.no_telepon || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                    {dsn.pendidikan_terakhir || '-'}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                                                    {dsn.prodi ? dsn.prodi.nama_prodi : '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleEdit(dsn)}
                                                            className="inline-flex items-center justify-center p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 transform hover:scale-110 transition-all duration-200 shadow-md hover:shadow-lg"
                                                            title="Edit"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(dsn)}
                                                            className="inline-flex items-center justify-center p-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700 transform hover:scale-110 transition-all duration-200 shadow-md hover:shadow-lg"
                                                            title="Hapus"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                            </div>

                            {/* Pagination */}
                            {dosen.links.length > 3 && (
                                <div className="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6">
                                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                        <div className="text-sm text-gray-700 dark:text-gray-300">
                                            Menampilkan {dosen.from} - {dosen.to} dari {dosen.total} data
                                        </div>
                                        <div className="flex gap-2">
                                            {dosen.links.map((link: any, index: number) => {
                                                const Component = link.url ? 'a' : 'span';
                                                return (
                                                    <Component
                                                        key={index}
                                                        href={link.url || undefined}
                                                        className={`px-3 py-1 rounded ${
                                                            link.active
                                                                ? 'bg-blue-600 text-white'
                                                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 border dark:border-gray-600'
                                                        } ${!link.url && 'cursor-not-allowed opacity-50'}`}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <ImportModal
                show={showImportModal}
                onClose={() => {
                    setShowImportModal(false);
                    setImportFile(null);
                }}
                onSubmit={handleImport}
                file={importFile}
                setFile={setImportFile}
                templateUrl="/admin/dosen/template/download"
                entityName="Dosen"
            />

            <DosenFormModal
                show={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSubmit={handleSubmitCreate}
                formData={formData}
                setFormData={setFormData}
                prodis={prodis}
                isEdit={false}
            />

            <DosenFormModal
                show={showEditModal}
                onClose={() => setShowEditModal(false)}
                onSubmit={handleSubmitEdit}
                formData={formData}
                setFormData={setFormData}
                prodis={prodis}
                isEdit={true}
            />

            <DeleteConfirmationModal
                show={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setSelectedDosen(null);
                }}
                onConfirm={confirmDelete}
                title="Hapus Data Dosen"
                message={`Apakah Anda yakin ingin menghapus data dosen`}
                itemName={selectedDosen ? `${selectedDosen.nama} (${selectedDosen.nidn})` : ''}
            />
            
            {/* Toast Notification */}
            {showToast && (
                <Toast
                    type={toastConfig.type as 'success' | 'error' | 'warning' | 'info'}
                    message={toastConfig.message}
                    details={toastConfig.details}
                    onClose={() => {
                        console.log('Toast onClose called');
                        setShowToast(false);
                    }}
                    duration={toastConfig.details?.length > 0 ? 8000 : 5000}
                />
            )}
        </div>
    );
}
