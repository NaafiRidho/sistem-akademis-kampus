import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import Sidebar from '@/Components/Layout/Sidebar';
import Header from '@/Components/Layout/Header';

declare function route(name: string, params?: any): string;

interface Pengumuman {
    id: number;
    judul: string;
    isi: string;
    target_role: string;
}

interface Props {
    pengumuman: Pengumuman;
}

export default function Edit({ pengumuman }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const { data, setData, put, processing, errors } = useForm({
        judul: pengumuman.judul || '',
        isi: pengumuman.isi || '',
        target_role: pengumuman.target_role || 'Semua',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('admin.pengumuman.update', pengumuman.id));
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header 
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    darkMode={darkMode}
                    setDarkMode={setDarkMode}
                    title="Edit Pengumuman"
                    subtitle="Ubah pengumuman"
                />
                <Head title="Edit Pengumuman" />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">

            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Edit Pengumuman</h2>
                                <Link
                                    href={route('admin.pengumuman.index')}
                                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                >
                                    Kembali
                                </Link>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Judul */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Judul Pengumuman <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.judul}
                                        onChange={(e) => setData('judul', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="Masukkan judul pengumuman"
                                        required
                                    />
                                    {errors.judul && (
                                        <p className="text-red-500 text-sm mt-1">{errors.judul}</p>
                                    )}
                                </div>

                                {/* Target Role */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Target Pengumuman <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.target_role}
                                        onChange={(e) => setData('target_role', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="Semua">Semua</option>
                                        <option value="Admin">Admin</option>
                                        <option value="Dosen">Dosen</option>
                                        <option value="Mahasiswa">Mahasiswa</option>
                                    </select>
                                    {errors.target_role && (
                                        <p className="text-red-500 text-sm mt-1">{errors.target_role}</p>
                                    )}
                                </div>

                                {/* Isi */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Isi Pengumuman <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={data.isi}
                                        onChange={(e) => setData('isi', e.target.value)}
                                        rows={10}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="Masukkan isi pengumuman"
                                        required
                                    />
                                    {errors.isi && (
                                        <p className="text-red-500 text-sm mt-1">{errors.isi}</p>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <div className="flex gap-4">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {processing ? 'Menyimpan...' : 'Update Pengumuman'}
                                    </button>
                                    <Link
                                        href={route('admin.pengumuman.index')}
                                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-center"
                                    >
                                        Batal
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            </main>
            </div>
        </div>
    );
}
