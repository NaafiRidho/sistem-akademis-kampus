import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import Sidebar from '@/Components/Layout/Sidebar';
import Header from '@/Components/Layout/Header';
import AbsensiFormModal from '@/Components/Modals/AbsensiFormModal';
import DeleteConfirmationModal from '@/Components/Modals/DeleteConfirmationModal';
import ImportModal from '@/Components/Modals/ImportModal';
import Toast from '@/Components/Toast';

interface Absensi {
    id: number;
    mahasiswa_id: number;
    jadwal_id: number;
    tanggal: string;
    status: string;
    keterangan: string;
    mahasiswa: {
        nim: string;
        nama: string;
    };
    jadwal: {
        hari: string;
        jam_mulai: string;
        jam_selesai: string;
        kelas: {
            kode_kelas: string;
            mata_kuliah: { nama_mk: string };
        };
    };
}

interface Mahasiswa {
    id: number;
    nim: string;
    nama: string;
}

interface Jadwal {
    id: number;
    hari: string;
    jam_mulai: string;
    jam_selesai: string;
    kelas: {
        kode_kelas: string;
        mata_kuliah: { nama_mk: string };
    };
}

interface Props {
    absensi: {
        data: Absensi[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    mahasiswa: Mahasiswa[];
    jadwal: Jadwal[];
    flash: {
        success?: string;
        error?: string;
    };
}

export default function Index({ absensi, mahasiswa, jadwal, flash }: Props) {
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
    const [selectedAbsensi, setSelectedAbsensi] = useState<Absensi | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    const [formData, setFormData] = useState({
        mahasiswa_id: '',
        jadwal_id: '',
        tanggal: '',
        status: '',
        keterangan: ''
    });

    const showToastMessage = (message: string, type: 'success' | 'error') => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);
    };

    if (flash.success && !showToast) {
        showToastMessage(flash.success, 'success');
    }

    if (flash.error && !showToast) {
        showToastMessage(flash.error, 'error');
    }

    const handleCreate = () => {
        setModalMode('create');
        setFormData({
            mahasiswa_id: '',
            jadwal_id: '',
            tanggal: new Date().toISOString().split('T')[0],
            status: '',
            keterangan: ''
        });
        setShowModal(true);
    };

    const handleEdit = (item: Absensi) => {
        setModalMode('edit');
        setSelectedAbsensi(item);
        setFormData({
            mahasiswa_id: item.mahasiswa_id.toString(),
            jadwal_id: item.jadwal_id.toString(),
            tanggal: item.tanggal,
            status: item.status,
            keterangan: item.keterangan || ''
        });
        setShowModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (modalMode === 'create') {
            router.post('/admin/absensi', formData, {
                onSuccess: () => setShowModal(false)
            });
        } else if (selectedAbsensi) {
            router.put(`/admin/absensi/${selectedAbsensi.id}`, formData, {
                onSuccess: () => setShowModal(false)
            });
        }
    };

    const handleDelete = (item: Absensi) => {
        setSelectedAbsensi(item);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (selectedAbsensi) {
            router.delete(`/admin/absensi/${selectedAbsensi.id}`, {
                onSuccess: () => setShowDeleteModal(false)
            });
        }
    };

    const handleImport = () => {
        if (importFile) {
            const formData = new FormData();
            formData.append('file', importFile);
            
            router.post('/admin/absensi/import', formData, {
                onSuccess: () => {
                    setShowImportModal(false);
                    setImportFile(null);
                }
            });
        }
    };

    const filteredAbsensi = absensi.data.filter(item => {
        const matchSearch = item.mahasiswa.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.mahasiswa.nim.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.jadwal.kelas.mata_kuliah.nama_mk.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = filterStatus === '' || item.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const getStatusBadge = (status: string) => {
        const badges = {
            'Hadir': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            'Izin': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            'Sakit': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            'Alpa': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        };
        return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('darkMode', String(darkMode));
    }, [darkMode]);

    return (
        <div className={darkMode ? 'dark' : ''}>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
                <Head title="Absensi Mahasiswa" />
                <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeMenu="absensi" />

                <div className={`p-4 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
                    <Header
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                        darkMode={darkMode}
                        setDarkMode={setDarkMode}
                        title="Absensi Mahasiswa"
                        subtitle="Kelola absensi mahasiswa"
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
                                Tambah Absensi
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
                                        placeholder="Cari mahasiswa, NIM, mata kuliah..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full px-4 py-3 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="px-4 py-3 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="">Semua Status</option>
                                        <option value="Hadir">Hadir</option>
                                        <option value="Izin">Izin</option>
                                        <option value="Sakit">Sakit</option>
                                        <option value="Alpa">Alpa</option>
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
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tanggal</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Mahasiswa</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Mata Kuliah</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Jadwal</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Keterangan</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                        {filteredAbsensi.length > 0 ? (
                                            filteredAbsensi.map((item, index) => (
                                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                                                        {index + 1}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                                                        <div>
                                                            <div className="font-medium">{new Date(item.tanggal).toLocaleDateString('id-ID')}</div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                {new Date(item.tanggal).toLocaleDateString('id-ID', { weekday: 'long' })}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                                                        <div>
                                                            <div className="font-medium">{item.mahasiswa.nama}</div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">{item.mahasiswa.nim}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                                                        {item.jadwal.kelas.mata_kuliah.nama_mk}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                                                        <div>
                                                            <div className="font-medium">{item.jadwal.hari}</div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                {item.jadwal.jam_mulai} - {item.jadwal.jam_selesai}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(item.status)}`}>
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                                                        {item.keterangan || '-'}
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
                                                <td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                                                    Tidak ada data absensi
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showModal && (
                <AbsensiFormModal
                    show={showModal}
                    onClose={() => setShowModal(false)}
                    onSubmit={handleSubmit}
                    formData={formData}
                    setFormData={setFormData}
                    mahasiswa={mahasiswa}
                    jadwal={jadwal}
                    isEdit={modalMode === 'edit'}
                />
            )}

            <DeleteConfirmationModal
                show={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Hapus Absensi"
                message={`Apakah Anda yakin ingin menghapus data absensi pada tanggal ${selectedAbsensi?.tanggal}?`}
                itemName={selectedAbsensi?.mahasiswa.nama || ''}
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
                templateUrl="/admin/absensi/template"
                entityName="Absensi"
            />

            {showToast && (
                <Toast
                    message={toastMessage}
                    type={toastType}
                    onClose={() => setShowToast(false)}
                />
            )}
        </div>
    );
}
