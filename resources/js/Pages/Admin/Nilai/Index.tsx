import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import Sidebar from '@/Components/Layout/Sidebar';
import Header from '@/Components/Layout/Header';
import Toast from '@/Components/Toast';

interface Nilai {
    id: number;
    mahasiswa_id: number;
    mata_kuliah_id: number;
    semester: number;
    tahun_ajaran: string;
    tugas: number;
    uts: number;
    uas: number;
    nilai_akhir: number;
    grade: string;
    mahasiswa: {
        id: number;
        nim: string;
        nama: string;
        prodi: {
            id: number;
            nama_prodi: string;
        };
    };
    mata_kuliah: {
        id: number;
        nama: string;
        kode: string;
        sks: number;
    };
}

interface Mahasiswa {
    id: number;
    nim: string;
    nama: string;
    prodi: {
        id: number;
        nama_prodi: string;
    };
}

interface MataKuliah {
    id: number;
    nama: string;
    kode: string;
    sks: number;
}

interface Prodi {
    id: number;
    nama_prodi: string;
}

interface Kelas {
    id: number;
    nama_kelas: string;
    prodi_id: number;
    prodi_nama: string;
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
    prodi: Prodi[];
    kelas: Kelas[];
    filters: {
        search?: string;
        prodi_id?: number;
        kelas_id?: number;
        mahasiswa_id?: number;
        mata_kuliah_id?: number;
        per_page?: number;
    };
    flash: {
        success?: string;
        error?: string;
    };
}

export default function Index({ nilai, mahasiswa, mataKuliah, prodi, kelas, filters, flash }: Props) {
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
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [filterGrade, setFilterGrade] = useState('');
    const [filterProdi, setFilterProdi] = useState(filters.prodi_id || '');
    const [filterKelas, setFilterKelas] = useState(filters.kelas_id || '');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

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

    const handleFilterChange = (key: string, value: string) => {
        const params: any = { ...filters };
        
        if (value) {
            params[key] = value;
        } else {
            delete params[key];
        }
        
        // Reset kelas filter when prodi changes
        if (key === 'prodi_id') {
            delete params.kelas_id;
            setFilterKelas('');
        }
        
        router.get('/admin/nilai', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const filteredNilai = nilai.data.filter(item => {
        const matchSearch = item.mahasiswa.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.mahasiswa.nim.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.mata_kuliah.nama.toLowerCase().includes(searchTerm.toLowerCase());
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
                        {/* Search & Filter */}
                        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center mb-4">
                                <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pencarian & Filter</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                                <div className="lg:col-span-2">
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
                                        value={filterProdi}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setFilterProdi(value);
                                            handleFilterChange('prodi_id', value);
                                        }}
                                        className="w-full px-4 py-3 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="">Semua Prodi</option>
                                        {prodi.map(p => (
                                            <option key={p.id} value={p.id}>{p.nama_prodi}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <select
                                        value={filterKelas}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setFilterKelas(value);
                                            handleFilterChange('kelas_id', value);
                                        }}
                                        disabled={!filterProdi}
                                        className="w-full px-4 py-3 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50"
                                    >
                                        <option value="">Semua Kelas</option>
                                        {kelas
                                            .filter(k => !filterProdi || k.prodi_id === parseInt(filterProdi as string))
                                            .map(k => (
                                                <option key={k.id} value={k.id}>{k.nama_kelas}</option>
                                            ))
                                        }
                                    </select>
                                </div>
                                <div>
                                    <select
                                        value={filterGrade}
                                        onChange={(e) => setFilterGrade(e.target.value)}
                                        className="w-full px-4 py-3 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                                                            <div className="font-medium">{item.mata_kuliah.nama}</div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">{item.mata_kuliah.kode} • {item.mata_kuliah.sks} SKS</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 dark:text-gray-300">
                                                        {item.tugas ?? 0}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 dark:text-gray-300">
                                                        {item.uts ?? 0}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 dark:text-gray-300">
                                                        {item.uas ?? 0}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-blue-600 dark:text-blue-400">
                                                        {Number(item.nilai_akhir ?? 0).toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getGradeBadgeColor(item.grade)}`}>
                                                            {item.grade}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={9} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                                                    Tidak ada data nilai
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {nilai.last_page > 1 && (
                                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-700 dark:text-gray-300">
                                            Menampilkan <span className="font-medium">{(nilai.current_page - 1) * nilai.per_page + 1}</span> - 
                                            <span className="font-medium"> {Math.min(nilai.current_page * nilai.per_page, nilai.total)}</span> dari 
                                            <span className="font-medium"> {nilai.total}</span> data
                                        </div>
                                        <div className="flex gap-2">
                                            {nilai.current_page > 1 && (
                                                <button
                                                    onClick={() => {
                                                        router.get('/admin/nilai', {
                                                            ...filters,
                                                            page: nilai.current_page - 1
                                                        }, {
                                                            preserveState: true,
                                                            preserveScroll: true,
                                                        });
                                                    }}
                                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                                                >
                                                    Sebelumnya
                                                </button>
                                            )}
                                            
                                            <div className="flex gap-1">
                                                {Array.from({ length: nilai.last_page }, (_, i) => i + 1)
                                                    .filter(page => {
                                                        return page === 1 || 
                                                               page === nilai.last_page || 
                                                               (page >= nilai.current_page - 1 && page <= nilai.current_page + 1);
                                                    })
                                                    .map((page, index, array) => (
                                                        <span key={page}>
                                                            {index > 0 && array[index - 1] !== page - 1 && (
                                                                <span className="px-2 py-2 text-gray-500">...</span>
                                                            )}
                                                            <button
                                                                onClick={() => {
                                                                    if (page !== nilai.current_page) {
                                                                        router.get('/admin/nilai', {
                                                                            ...filters,
                                                                            page: page
                                                                        }, {
                                                                            preserveState: true,
                                                                            preserveScroll: true,
                                                                        });
                                                                    }
                                                                }}
                                                                className={`px-4 py-2 text-sm font-medium rounded-lg ${
                                                                    page === nilai.current_page
                                                                        ? 'bg-blue-600 text-white'
                                                                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
                                                                }`}
                                                            >
                                                                {page}
                                                            </button>
                                                        </span>
                                                    ))
                                                }
                                            </div>

                                            {nilai.current_page < nilai.last_page && (
                                                <button
                                                    onClick={() => {
                                                        router.get('/admin/nilai', {
                                                            ...filters,
                                                            page: nilai.current_page + 1
                                                        }, {
                                                            preserveState: true,
                                                            preserveScroll: true,
                                                        });
                                                    }}
                                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                                                >
                                                    Selanjutnya
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

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
