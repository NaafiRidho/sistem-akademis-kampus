import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import Sidebar from '@/Components/Layout/Sidebar';
import Header from '@/Components/Layout/Header';
import JadwalFormModal from '@/Components/Modals/JadwalFormModal';
import DeleteConfirmationModal from '@/Components/Modals/DeleteConfirmationModal';
import ImportModal from '@/Components/Modals/ImportModal';
import Toast from '@/Components/Toast';

interface Jadwal {
    id: number;
    kelas_id: number;
    mata_kuliah_id: number;
    dosen_id: number;
    hari: string;
    jam_mulai: string;
    jam_selesai: string;
    ruangan: string;
    kelas: {
        nama_kelas: string;
        kode_kelas: string;
        prodi: { nama_prodi: string };
        dosen: {
            nama: string;
        };
    };
    mataKuliah: {
        kode_mk: string;
        nama_mk: string;
    };
    dosen: {
        nama: string;
    };
}

interface Kelas {
    id: number;
    nama_kelas: string;
    kode_kelas: string;
    prodi: { nama_prodi: string };
    dosen: {
        nama: string;
    };
}

interface MataKuliah {
    id: number;
    kode_mk: string;
    nama_mk: string;
    prodi: { nama_prodi: string };
}

interface Dosen {
    id: number;
    nip: string;
    nama: string;
}

interface Props {
    jadwal: {
        data: Jadwal[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    kelas: Kelas[];
    mataKuliah: MataKuliah[];
    dosen: Dosen[];
    flash: {
        success?: string;
        error?: string;
    };
}

export default function Index({ jadwal, kelas, mataKuliah, dosen, flash }: Props) {
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
    const [selectedJadwal, setSelectedJadwal] = useState<Jadwal | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterHari, setFilterHari] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    const [formData, setFormData] = useState({
        kelas_id: '',
        mata_kuliah_id: '',
        dosen_id: '',
        hari: '',
        jam_mulai: '',
        jam_selesai: '',
        ruangan: ''
    });

    const hariOptions = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

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
            kelas_id: '',
            mata_kuliah_id: '',
            dosen_id: '',
            hari: '',
            jam_mulai: '',
            jam_selesai: '',
            ruangan: ''
        });
        setShowModal(true);
    };

    const handleEdit = (item: Jadwal) => {
        setModalMode('edit');
        setSelectedJadwal(item);
        setFormData({
            kelas_id: item.kelas_id.toString(),
            mata_kuliah_id: item.mata_kuliah_id.toString(),
            dosen_id: item.dosen_id.toString(),
            hari: item.hari,
            jam_mulai: item.jam_mulai,
            jam_selesai: item.jam_selesai,
            ruangan: item.ruangan
        });
        setShowModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (modalMode === 'create') {
            router.post('/admin/jadwal', formData, {
                onSuccess: () => setShowModal(false)
            });
        } else if (selectedJadwal) {
            router.put(`/admin/jadwal/${selectedJadwal.id}`, formData, {
                onSuccess: () => setShowModal(false)
            });
        }
    };

    const handleDelete = (item: Jadwal) => {
        setSelectedJadwal(item);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (selectedJadwal) {
            router.delete(`/admin/jadwal/${selectedJadwal.id}`, {
                onSuccess: () => setShowDeleteModal(false)
            });
        }
    };

    const handleImport = () => {
        if (importFile) {
            const formData = new FormData();
            formData.append('file', importFile);
            
            router.post('/admin/jadwal/import', formData, {
                onSuccess: () => {
                    setShowImportModal(false);
                    setImportFile(null);
                }
            });
        }
    };

    const filteredJadwal = jadwal.data.filter(item => {
        const matchSearch = item.mataKuliah.nama_mk.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.kelas.nama_kelas.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.dosen.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.ruangan.toLowerCase().includes(searchTerm.toLowerCase());
        const matchHari = filterHari === '' || item.hari === filterHari;
        return matchSearch && matchHari;
    });

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
                <Head title="Jadwal Kuliah" />
                <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeMenu="jadwal" />

                <div className={`p-4 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
                    <Header
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                        darkMode={darkMode}
                        setDarkMode={setDarkMode}
                        title="Jadwal Kuliah"
                        subtitle="Kelola jadwal kuliah"
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
                                Tambah Jadwal
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
                                        placeholder="Cari mata kuliah, dosen, ruangan..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full px-4 py-3 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <select
                                        value={filterHari}
                                        onChange={(e) => setFilterHari(e.target.value)}
                                        className="px-4 py-3 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="">Semua Hari</option>
                                        {hariOptions.map(hari => (
                                            <option key={hari} value={hari}>{hari}</option>
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
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Hari</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Waktu</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ruangan</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Mata Kuliah</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Dosen</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Kelas</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                        {filteredJadwal.length > 0 ? (
                                            filteredJadwal.map((item, index) => (
                                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                                                        {index + 1}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                                                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                            {item.hari}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                                                        {item.jam_mulai} - {item.jam_selesai}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                                                        <span className="font-medium">{item.ruangan}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                                                        <div>
                                                            <div className="font-medium">{item.mataKuliah.nama_mk}</div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">{item.mataKuliah.kode_mk}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                                                        {item.kelas.dosen.nama}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                                                        {item.kelas.kode_kelas}
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
                                                    Tidak ada data jadwal
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
                <JadwalFormModal
                    show={showModal}
                    onClose={() => setShowModal(false)}
                    onSubmit={handleSubmit}
                    formData={formData}
                    setFormData={setFormData}
                    kelas={kelas}
                    mataKuliah={mataKuliah}
                    dosen={dosen}
                    isEdit={modalMode === 'edit'}
                />
            )}

            <DeleteConfirmationModal
                show={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Hapus Jadwal"
                message={`Apakah Anda yakin ingin menghapus jadwal pada hari ${selectedJadwal?.hari}?`}
                itemName={selectedJadwal?.mataKuliah.nama_mk || ''}
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
                templateUrl="/admin/jadwal/template"
                entityName="Jadwal"
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
