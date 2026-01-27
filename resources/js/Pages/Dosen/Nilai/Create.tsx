import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import DosenSidebar from '@/Components/Layout/DosenSidebar';
import Header from '@/Components/Layout/Header';

interface Mahasiswa {
    id: number;
    nim: string;
    nama: string;
    nilai?: {
        tugas: string;
        uts: string;
        uas: string;
    };
}

interface FormData {
    mata_kuliah_id: string;
    kelas_id: string;
    semester: string;
    tahun_ajaran: string;
    nilai: {
        mahasiswa_id: number;
        tugas: string;
        uts: string;
        uas: string;
    }[];
}

interface Props {
    mataKuliahList?: any[];
    kelasList?: any[];
}

export default function NilaiCreate({ mataKuliahList = [], kelasList = [] }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 1024;
        }
        return true;
    });
    const [darkMode, setDarkMode] = useState(false);
    const [mahasiswaList, setMahasiswaList] = useState<Mahasiswa[]>([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        mata_kuliah_id: '',
        kelas_id: '',
        semester: 'Ganjil',
        tahun_ajaran: '2024/2025',
        nilai: [],
    });
    const [errors, setErrors] = useState<any>({});

    useEffect(() => {
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        setDarkMode(savedDarkMode);
    }, []);

    // Load mahasiswa when kelas and mata kuliah selected
    useEffect(() => {
        if (formData.kelas_id && formData.mata_kuliah_id) {
            loadMahasiswa();
        } else {
            setMahasiswaList([]);
            setFormData(prev => ({ ...prev, nilai: [] }));
        }
    }, [formData.kelas_id, formData.mata_kuliah_id]);

    const loadMahasiswa = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/dosen/nilai/get-mahasiswa', {
                params: {
                    kelas_id: formData.kelas_id,
                    mata_kuliah_id: formData.mata_kuliah_id,
                },
            });
            const mahasiswaData = response.data?.mahasiswa || response.data?.data || [];
            setMahasiswaList(mahasiswaData);

            // Initialize nilai for each mahasiswa
            const initialNilai = mahasiswaData.map((mhs: Mahasiswa) => ({
                mahasiswa_id: mhs.id,
                tugas: mhs.nilai?.tugas || '',
                uts: mhs.nilai?.uts || '',
                uas: mhs.nilai?.uas || '',
            }));
            setFormData(prev => ({ ...prev, nilai: initialNilai }));
        } catch (error: any) {
            console.error('Error loading mahasiswa:', error);
            setMahasiswaList([]);
            setFormData(prev => ({ ...prev, nilai: [] }));
            alert(error.response?.data?.message || 'Gagal memuat data mahasiswa');
        } finally {
            setLoading(false);
        }
    };

    const handleNilaiChange = (mahasiswaId: number, field: 'tugas' | 'uts' | 'uas', value: string) => {
        // Validate numeric input
        if (value !== '' && (isNaN(Number(value)) || Number(value) < 0 || Number(value) > 100)) {
            return;
        }

        setFormData(prev => ({
            ...prev,
            nilai: prev.nilai.map(n =>
                n.mahasiswa_id === mahasiswaId
                    ? { ...n, [field]: value }
                    : n
            ),
        }));
    };

    const calculateNilaiAkhir = (tugas: string, uts: string, uas: string) => {
        const t = parseFloat(tugas) || 0;
        const ut = parseFloat(uts) || 0;
        const ua = parseFloat(uas) || 0;
        return (t * 0.3 + ut * 0.3 + ua * 0.4).toFixed(2);
    };

    const getGrade = (nilaiAkhir: number) => {
        if (nilaiAkhir >= 85) return 'A';
        if (nilaiAkhir >= 70) return 'B';
        if (nilaiAkhir >= 60) return 'C';
        if (nilaiAkhir >= 50) return 'D';
        return 'E';
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate
        if (!formData.mata_kuliah_id || !formData.kelas_id) {
            alert('Pilih Mata Kuliah dan Kelas terlebih dahulu');
            return;
        }

        if (formData.nilai.length === 0) {
            alert('Tidak ada mahasiswa yang akan diinput nilai');
            return;
        }

        const submitData = {
            mata_kuliah_id: formData.mata_kuliah_id,
            kelas_id: formData.kelas_id,
            semester: formData.semester,
            tahun_ajaran: formData.tahun_ajaran,
            nilai: formData.nilai
        };

        router.post('/dosen/nilai', submitData, {
            onError: (errors) => {
                setErrors(errors);
                console.error('Validation errors:', errors);
            },
        });
    };

    return (
        <div className={darkMode ? 'dark' : ''}>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
                <Head title="Input Nilai" />

                <DosenSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeMenu="nilai" />

                <div className={`p-4 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
                    <Header
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                        darkMode={darkMode}
                        setDarkMode={setDarkMode}
                        title="Input Nilai"
                        subtitle="Input nilai mahasiswa untuk mata kuliah yang Anda ajar"
                    />

                    <div className="mt-6 max-w-7xl">
                        {/* Header */}
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Input Nilai Mahasiswa
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Input nilai Tugas, UTS, dan UAS untuk mahasiswa
                            </p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* Form Configuration */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Pilih Kelas dan Mata Kuliah
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {/* Mata Kuliah */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Mata Kuliah <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={formData.mata_kuliah_id}
                                            onChange={(e) => setFormData(prev => ({ ...prev, mata_kuliah_id: e.target.value }))}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                            required
                                        >
                                            <option value="">Pilih Mata Kuliah</option>
                                        {mataKuliahList && mataKuliahList.map((mk) => (
                                                <option key={mk.id} value={mk.id}>
                                                    {mk.kode_mk} - {mk.nama_mk}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.mata_kuliah_id && (
                                            <p className="text-red-500 text-sm mt-1">{errors.mata_kuliah_id}</p>
                                        )}
                                    </div>

                                    {/* Kelas */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Kelas <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={formData.kelas_id}
                                            onChange={(e) => setFormData(prev => ({ ...prev, kelas_id: e.target.value }))}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                            required
                                        >
                                            <option value="">Pilih Kelas</option>
                                            {kelasList && kelasList.map((kelas) => (
                                                <option key={kelas.id} value={kelas.id}>
                                                    {kelas.nama_kelas}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.kelas_id && (
                                            <p className="text-red-500 text-sm mt-1">{errors.kelas_id}</p>
                                        )}
                                    </div>

                                    {/* Semester */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Semester <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={formData.semester}
                                            onChange={(e) => setFormData(prev => ({ ...prev, semester: e.target.value }))}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                            required
                                        >
                                            <option value="Ganjil">Ganjil</option>
                                            <option value="Genap">Genap</option>
                                        </select>
                                    </div>

                                    {/* Tahun Ajaran */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Tahun Ajaran <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={formData.tahun_ajaran}
                                            onChange={(e) => setFormData(prev => ({ ...prev, tahun_ajaran: e.target.value }))}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                            required
                                        >
                                            <option value="2023/2024">2023/2024</option>
                                            <option value="2024/2025">2024/2025</option>
                                            <option value="2025/2026">2025/2026</option>
                                            <option value="2026/2027">2026/2027</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Loading State */}
                            {loading && (
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center mb-6">
                                    <div className="flex flex-col items-center">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                                        <p className="text-gray-600 dark:text-gray-400">Memuat data mahasiswa...</p>
                                    </div>
                                </div>
                            )}

                            {/* Student List */}
                            {!loading && mahasiswaList && mahasiswaList.length > 0 && (
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                                    <div className="px-6 py-4 bg-linear-to-r from-blue-600 to-purple-600">
                                        <h3 className="text-lg font-semibold text-white">
                                            Daftar Mahasiswa ({mahasiswaList.length} orang)
                                        </h3>
                                        <p className="text-blue-100 text-sm">
                                            Nilai: 0-100 | Bobot: Tugas 30% + UTS 30% + UAS 40%
                                        </p>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 dark:bg-gray-700">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                        No
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                        NIM
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                        Nama Mahasiswa
                                                    </th>
                                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                        Tugas (30%)
                                                    </th>
                                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                        UTS (30%)
                                                    </th>
                                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                        UAS (40%)
                                                    </th>
                                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                        Nilai Akhir
                                                    </th>
                                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                        Grade
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                {mahasiswaList.map((mahasiswa, index) => {
                                                    const nilaiData = formData.nilai.find(n => n.mahasiswa_id === mahasiswa.id);
                                                    const nilaiAkhir = nilaiData
                                                        ? calculateNilaiAkhir(nilaiData.tugas, nilaiData.uts, nilaiData.uas)
                                                        : '-';
                                                    const grade = typeof nilaiAkhir === 'number'
                                                        ? getGrade(nilaiAkhir)
                                                        : '-';

                                                    return (
                                                        <tr key={mahasiswa.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                                                {index + 1}
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                                                {mahasiswa.nim}
                                                            </td>
                                                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                                                {mahasiswa.nama}
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    max="100"
                                                                    step="0.01"
                                                                    value={nilaiData?.tugas || ''}
                                                                    onChange={(e) => handleNilaiChange(mahasiswa.id, 'tugas', e.target.value)}
                                                                    className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-center"
                                                                    placeholder="0-100"
                                                                />
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    max="100"
                                                                    step="0.01"
                                                                    value={nilaiData?.uts || ''}
                                                                    onChange={(e) => handleNilaiChange(mahasiswa.id, 'uts', e.target.value)}
                                                                    className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-center"
                                                                    placeholder="0-100"
                                                                />
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    max="100"
                                                                    step="0.01"
                                                                    value={nilaiData?.uas || ''}
                                                                    onChange={(e) => handleNilaiChange(mahasiswa.id, 'uas', e.target.value)}
                                                                    className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-center"
                                                                    placeholder="0-100"
                                                                />
                                                            </td>
                                                            <td className="px-6 py-4 text-center text-sm font-bold text-blue-600 dark:text-blue-400">
                                                                {nilaiAkhir}
                                                            </td>
                                                            <td className="px-6 py-4 text-center text-sm font-bold text-purple-600 dark:text-purple-400">
                                                                {grade}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                                        <button
                                            type="button"
                                            onClick={() => router.get('/dosen/nilai')}
                                            className="px-6 py-2 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-8 py-2 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold shadow-lg transition"
                                        >
                                            Simpan Nilai
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Empty State */}
                            {!loading && mahasiswaList.length === 0 && formData.kelas_id && formData.mata_kuliah_id && (
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
                                    <svg className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                                        Tidak ada mahasiswa di kelas ini
                                    </p>
                                </div>
                            )}

                            {!formData.kelas_id || !formData.mata_kuliah_id ? (
                                <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 p-6 rounded-lg">
                                    <div className="flex">
                                        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div>
                                            <h4 className="text-blue-900 dark:text-blue-300 font-semibold mb-1">
                                                Informasi
                                            </h4>
                                            <p className="text-blue-700 dark:text-blue-400 text-sm">
                                                Silakan pilih Mata Kuliah dan Kelas untuk menampilkan daftar mahasiswa
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
