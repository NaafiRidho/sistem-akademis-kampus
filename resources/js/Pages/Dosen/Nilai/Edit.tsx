import { useState, useEffect, FormEvent } from 'react';
import { Head, router } from '@inertiajs/react';
import DosenSidebar from '@/Components/Layout/DosenSidebar';
import Header from '@/Components/Layout/Header';

interface Mahasiswa {
    id: number;
    nim: string;
    nama: string;
    kelas: string;
    prodi: string;
}

interface MataKuliah {
    id: number;
    nama: string;
    kode: string;
    sks: number;
}

interface Nilai {
    id: number;
    mahasiswa: Mahasiswa;
    mata_kuliah: MataKuliah;
    semester: string;
    tahun_ajaran: string;
    tugas: number;
    uts: number;
    uas: number;
    nilai_akhir: number;
    grade: string;
}

interface FormData {
    tugas: string;
    uts: string;
    uas: string;
}

interface Props {
    nilai: Nilai;
}

export default function NilaiEdit({ nilai }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        tugas: nilai.tugas?.toString() || '',
        uts: nilai.uts?.toString() || '',
        uas: nilai.uas?.toString() || '',
    });
    const [errors, setErrors] = useState<any>({});

    useEffect(() => {
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        setDarkMode(savedDarkMode);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        
        // Validate numeric input
        if (value !== '' && (isNaN(Number(value)) || Number(value) < 0 || Number(value) > 100)) {
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const calculateNilaiAkhir = () => {
        const tugas = parseFloat(formData.tugas) || 0;
        const uts = parseFloat(formData.uts) || 0;
        const uas = parseFloat(formData.uas) || 0;
        return (tugas * 0.3 + uts * 0.3 + uas * 0.4).toFixed(2);
    };

    const getGrade = (nilaiAkhir: number) => {
        if (nilaiAkhir >= 85) return 'A';
        if (nilaiAkhir >= 70) return 'B';
        if (nilaiAkhir >= 60) return 'C';
        if (nilaiAkhir >= 50) return 'D';
        return 'E';
    };

    const getGradeBadge = (grade: string) => {
        const badges: Record<string, string> = {
            'A': 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
            'B': 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
            'C': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
            'D': 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
            'E': 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
        };
        return badges[grade] || 'bg-gray-100 text-gray-700';
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        const submitData = {
            tugas: formData.tugas,
            uts: formData.uts,
            uas: formData.uas
        };

        router.put(`/dosen/nilai/${nilai.id}`, submitData, {
            onError: (errors) => {
                setErrors(errors);
                console.error('Validation errors:', errors);
            },
        });
    };

    const nilaiAkhir = parseFloat(calculateNilaiAkhir());
    const currentGrade = getGrade(nilaiAkhir);

    return (
        <div className={darkMode ? 'dark' : ''}>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
                <Head title="Edit Nilai" />

                <DosenSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeMenu="nilai" />

                <div className={`p-4 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
                    <Header
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                        darkMode={darkMode}
                        setDarkMode={setDarkMode}
                        title="Edit Nilai"
                        subtitle="Edit nilai mahasiswa"
                    />

                    <div className="mt-6 max-w-4xl">
                        {/* Header */}
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Edit Nilai Mahasiswa
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Edit nilai untuk mahasiswa terpilih
                            </p>
                        </div>

                        {/* Student Info Card */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 mb-6 text-white">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-blue-100 text-sm mb-1">Mahasiswa</p>
                                    <p className="text-xl font-bold">{nilai.mahasiswa.nama}</p>
                                    <p className="text-blue-100 text-sm mt-1">NIM: {nilai.mahasiswa.nim}</p>
                                </div>
                                <div>
                                    <p className="text-blue-100 text-sm mb-1">Mata Kuliah</p>
                                    <p className="text-lg font-semibold">{nilai.mata_kuliah.nama}</p>
                                    <p className="text-blue-100 text-sm mt-1">
                                        {nilai.mata_kuliah.kode} - {nilai.mata_kuliah.sks} SKS
                                    </p>
                                </div>
                                <div>
                                    <p className="text-blue-100 text-sm mb-1">Kelas</p>
                                    <p className="text-lg font-semibold">{nilai.mahasiswa.kelas}</p>
                                </div>
                                <div>
                                    <p className="text-blue-100 text-sm mb-1">Periode</p>
                                    <p className="text-lg font-semibold">
                                        {nilai.semester} {nilai.tahun_ajaran}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Edit Form */}
                        <form onSubmit={handleSubmit}>
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                                    Edit Komponen Nilai
                                </h3>

                                <div className="space-y-6">
                                    {/* Tugas */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Nilai Tugas (Bobot 30%) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="tugas"
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            value={formData.tugas}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                            placeholder="0 - 100"
                                            required
                                        />
                                        {errors.tugas && (
                                            <p className="text-red-500 text-sm mt-1">{errors.tugas}</p>
                                        )}
                                    </div>

                                    {/* UTS */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Nilai UTS (Bobot 30%) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="uts"
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            value={formData.uts}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                            placeholder="0 - 100"
                                            required
                                        />
                                        {errors.uts && (
                                            <p className="text-red-500 text-sm mt-1">{errors.uts}</p>
                                        )}
                                    </div>

                                    {/* UAS */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Nilai UAS (Bobot 40%) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="uas"
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            value={formData.uas}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                            placeholder="0 - 100"
                                            required
                                        />
                                        {errors.uas && (
                                            <p className="text-red-500 text-sm mt-1">{errors.uas}</p>
                                        )}
                                    </div>

                                    {/* Preview Nilai Akhir */}
                                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 border-2 border-blue-200 dark:border-blue-800">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Nilai Akhir</p>
                                                <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                                                    {nilaiAkhir.toFixed(2)}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                                    (30% × {formData.tugas || 0}) + (30% × {formData.uts || 0}) + (40% × {formData.uas || 0})
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Grade</p>
                                                <span className={`inline-block px-6 py-3 rounded-xl text-3xl font-bold ${getGradeBadge(currentGrade)}`}>
                                                    {currentGrade}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Buttons */}
                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => router.get('/dosen/nilai')}
                                        className="flex-1 px-6 py-3 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold shadow-lg transition"
                                    >
                                        Simpan Perubahan
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
