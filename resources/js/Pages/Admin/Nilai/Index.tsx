import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import Sidebar from '@/Components/Layout/Sidebar';
import Header from '@/Components/Layout/Header';
import NilaiFormModal from '@/Components/Modals/NilaiFormModal';
import DeleteConfirmationModal from '@/Components/Modals/DeleteConfirmationModal';
import ImportModal from '@/Components/Modals/ImportModal';
import Toast from '@/Components/Toast';

interface Nilai {
    id: number;
    mahasiswa_id: number;
    mata_kuliah_id: number;
    tugas: number;
    uts: number;
    uas: number;
    nilai_akhir: number;
    grade: string;
    mahasiswa: {
        nim: string;
        nama: string;
    };
    mata_kuliah: {
        kode_mk: string;
        nama_mk: string;
    };
}

interface Mahasiswa {
    id: number;
    nim: string;
    nama: string;
}

interface MataKuliah {
    id: number;
    kode_mk: string;
    nama_mk: string;
}

interface Props {
    nilai: {
        data: Nilai[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    mahasiswa: Mahasiswa[];
    mataKuliah: MataKuliah[];
    flash: {
        success?: string;
        error?: string;
    };
}

export default function Index({ nilai, mahasiswa, mataKuliah, flash }: Props) {
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
    const [selectedNilai, setSelectedNilai] = useState<Nilai | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterGrade, setFilterGrade] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    const [formData, setFormData] = useState({
        mahasiswa_id: '',
        mata_kuliah_id: '',
        tugas: '',
        uts: '',
        uas: ''
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
            mata_kuliah_id: '',
            tugas: '',
            uts: '',
            uas: ''
        });
        setShowModal(true);
    };

    const handleEdit = (item: Nilai) => {
        setModalMode('edit');
        setSelectedNilai(item);
        setFormData({
            mahasiswa_id: item.mahasiswa_id.toString(),
            mata_kuliah_id: item.mata_kuliah_id.toString(),
            tugas: item.tugas.toString(),
            uts: item.uts.toString(),
            uas: item.uas.toString()
        });
        setShowModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (modalMode === 'create') {
            router.post('/admin/nilai', formData, {
                onSuccess: () => setShowModal(false)
            });
        } else if (selectedNilai) {
            router.put(`/admin/nilai/${selectedNilai.id}`, formData, {
                onSuccess: () => setShowModal(false)
            });
        }
    };

    const handleDelete = (item: Nilai) => {
        setSelectedNilai(item);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (selectedNilai) {
            router.delete(`/admin/nilai/${selectedNilai.id}`, {
                onSuccess: () => setShowDeleteModal(false)
            });
        }
    };

    const handleImport = () => {
        if (importFile) {
            const formData = new FormData();
            formData.append('file', importFile);
            
            router.post('/admin/nilai/import', formData, {
                onSuccess: () => {
                    setShowImportModal(false);
                    setImportFile(null);
                }
            });
        }
    };

    const filteredNilai = nilai.data.filter(item => {
        const matchSearch = item.mahasiswa.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.mahasiswa.nim.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.mata_kuliah.nama_mk.toLowerCase().includes(searchTerm.toLowerCase());
        const matchGrade = filterGrade === '' || item.grade === filterGrade;
        return matchSearch && matchGrade;
    });

    const getGradeBadgeColor = (grade: string) => {
        switch(grade) {
            case 'A': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'B': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'C': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'D': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
            case 'E': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
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
                <Head title="Nilai Mahasiswa" />
                <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeMenu="nilai" />

                <div className={`p-4 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
                    <Header
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                        darkMode={darkMode}
                        setDarkMode={setDarkMode}
                        title="Nilai Mahasiswa"
                        subtitle="Kelola nilai mahasiswa"
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
                                Tambah Nilai
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
                                        value={filterGrade}
                                        onChange={(e) => setFilterGrade(e.target.value)}
                                        className="px-4 py-3 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="">Semua Grade</option>
                                        <option value="A">A</option>
                                        <option value="B">B</option>
                                        <option value="C">C</option>
                                        <option value="D">D</option>
                                        <option value="E">E</option>
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
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">NIM</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nama Mahasiswa</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Mata Kuliah</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tugas</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">UTS</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">UAS</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nilai Akhir</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Grade</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                        {filteredNilai.length > 0 ? (
                                            filteredNilai.map((item, index) => (
                                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                                                        {index + 1}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-300">
                                                        {item.mahasiswa.nim}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                                                        {item.mahasiswa.nama}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                                                        <div>
                                                            <div className="font-medium">{item.mata_kuliah.nama_mk}</div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">{item.mata_kuliah.kode_mk}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 dark:text-gray-300">
                                                        {item.tugas}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 dark:text-gray-300">
                                                        {item.uts}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 dark:text-gray-300">
                                                        {item.uas}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-blue-600 dark:text-blue-400">
                                                        {item.nilai_akhir.toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getGradeBadgeColor(item.grade)}`}>
                                                            {item.grade}
                                                        </span>
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
                                                <td colSpan={10} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                                                    Tidak ada data nilai
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
                <NilaiFormModal
                    show={showModal}
                    onClose={() => setShowModal(false)}
                    onSubmit={handleSubmit}
                    formData={formData}
                    setFormData={setFormData}
                    mahasiswa={mahasiswa}
                    mataKuliah={mataKuliah}
                    isEdit={modalMode === 'edit'}
                />
            )}

            <DeleteConfirmationModal
                show={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Hapus Nilai"
                message={`Apakah Anda yakin ingin menghapus nilai untuk mata kuliah ${selectedNilai?.mata_kuliah.nama_mk}?`}
                itemName={selectedNilai?.mahasiswa.nama || ''}
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
                templateUrl="/admin/nilai/template"
                entityName="Nilai"
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
