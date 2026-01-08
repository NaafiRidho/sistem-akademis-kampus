import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import Sidebar from '@/Components/Layout/Sidebar';
import Header from '@/Components/Layout/Header';
import EditStatusAbsensiModal from '@/Components/Modals/EditStatusAbsensiModal';
import DeleteConfirmationModal from '@/Components/Modals/DeleteConfirmationModal';
import Toast from '@/Components/Toast';
import Pagination from '@/Components/Pagination';

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
            nama_kelas: string;
        };
        mata_kuliah: {
            id: number;
            nama: string;
            kode: string;
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
        id: number;
        nama_kelas: string;
    };
    mata_kuliah: {
        id: number;
        nama: string;
        kode: string;
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
    const [selectedAbsensi, setSelectedAbsensi] = useState<Absensi | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [formData, setFormData] = useState({
        status: '',
        keterangan: ''
    });

    const showToastMessage = (message: string, type: 'success' | 'error') => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);
    };

    useEffect(() => {
        if (flash.success) {
            showToastMessage(flash.success, 'success');
        }
        if (flash.error) {
            showToastMessage(flash.error, 'error');
        }
    }, [flash]);

    const handleEdit = (item: Absensi) => {
        setSelectedAbsensi(item);
        setFormData({
            status: item.status,
            keterangan: item.keterangan || ''
        });
        setShowModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (selectedAbsensi) {
            setIsLoading(true);
            router.put(`/admin/absensi/${selectedAbsensi.id}`, formData, {
                preserveState: false,
                preserveScroll: true,
                onSuccess: () => {
                    setShowModal(false);
                    setIsLoading(false);
                },
                onError: (errors) => {
                    setIsLoading(false);
                    const errorMessage = Object.values(errors).flat().join(', ') || 'Gagal memperbarui status absensi!';
                    showToastMessage(errorMessage, 'error');
                }
            });
        }
    };

    const handleDelete = (item: Absensi) => {
        setSelectedAbsensi(item);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (selectedAbsensi) {
            setIsDeleting(true);
            router.delete(`/admin/absensi/${selectedAbsensi.id}`, {
                preserveState: false,
                preserveScroll: true,
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setIsDeleting(false);
                },
                onError: (errors) => {
                    setIsDeleting(false);
                    const errorMessage = Object.values(errors).flat().join(', ') || 'Gagal menghapus data absensi!';
                    showToastMessage(errorMessage, 'error');
                }
            });
        }
    };

    // Use server-side pagination data directly
    const displayedAbsensi = absensi.data;
    
    // Handle search and filter with debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const params: any = {};
            if (searchTerm) params.search = searchTerm;
            if (filterStatus) params.status = filterStatus;
            
            router.get('', params, { 
                preserveState: true, 
                preserveScroll: true 
            });
        }, 500);
        
        return () => clearTimeout(timeoutId);
    }, [searchTerm, filterStatus]);

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
                                        {displayedAbsensi.length > 0 ? (
                                            displayedAbsensi.map((item, index) => (
                                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                                                        {(absensi.current_page - 1) * absensi.per_page + index + 1}
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
                                                        <div>
                                                            <div className="font-medium">{item.jadwal?.mata_kuliah?.nama || '-'}</div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">{item.jadwal?.mata_kuliah?.kode || ''}</div>
                                                        </div>
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
                                                        {item.keterangan ? (
                                                            <div className="max-w-xs">
                                                                <div className="truncate" title={item.keterangan}>
                                                                    {item.keterangan}
                                                                </div>
                                                                {item.keterangan.length > 50 && (
                                                                    <button
                                                                        onClick={() => {
                                                                            const modal = document.createElement('div');
                                                                            modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
                                                                            modal.innerHTML = `
                                                                                <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg mx-4 shadow-xl">
                                                                                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Keterangan Lengkap</h3>
                                                                                    <p class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">${item.keterangan}</p>
                                                                                    <button class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full">Tutup</button>
                                                                                </div>
                                                                            `;
                                                                            modal.addEventListener('click', (e) => {
                                                                                if (e.target === modal || (e.target as HTMLElement).tagName === 'BUTTON') {
                                                                                    modal.remove();
                                                                                }
                                                                            });
                                                                            document.body.appendChild(modal);
                                                                        }}
                                                                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1"
                                                                    >
                                                                        Lihat selengkapnya
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400 dark:text-gray-500 italic">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                        <div className="flex justify-center gap-2">
                                                            {item.status !== 'Hadir' && (
                                                                <button
                                                                    onClick={() => handleEdit(item)}
                                                                    className="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/30 rounded-lg shadow-md hover:shadow-lg transform hover:scale-110 transition-all duration-200"
                                                                    title="Edit"
                                                                >
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                    </svg>
                                                                </button>
                                                            )}
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
                            
                            {/* Pagination */}
                            <Pagination
                                currentPage={absensi.current_page}
                                lastPage={absensi.last_page}
                                total={absensi.total}
                                perPage={absensi.per_page}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {showModal && selectedAbsensi && (
                <EditStatusAbsensiModal
                    show={showModal}
                    onClose={() => {
                        if (!isLoading) {
                            setShowModal(false);
                        }
                    }}
                    onSubmit={handleSubmit}
                    formData={formData}
                    setFormData={setFormData}
                    mahasiswaInfo={{
                        nama: selectedAbsensi.mahasiswa.nama,
                        nim: selectedAbsensi.mahasiswa.nim
                    }}
                    jadwalInfo={{
                        mata_kuliah: selectedAbsensi.jadwal?.mata_kuliah?.nama || '-',
                        hari: selectedAbsensi.jadwal.hari,
                        jam: `${selectedAbsensi.jadwal.jam_mulai} - ${selectedAbsensi.jadwal.jam_selesai}`
                    }}
                    tanggal={selectedAbsensi.tanggal}
                    isLoading={isLoading}
                />
            )}

            <DeleteConfirmationModal
                show={showDeleteModal}
                onClose={() => {
                    if (!isDeleting) {
                        setShowDeleteModal(false);
                    }
                }}
                onConfirm={confirmDelete}
                title="Hapus Absensi"
                message={`Apakah Anda yakin ingin menghapus data absensi pada tanggal ${selectedAbsensi?.tanggal}?`}
                itemName={selectedAbsensi?.mahasiswa.nama || ''}
                isLoading={isDeleting}
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
