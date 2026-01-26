import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import Sidebar from '@/Components/Layout/Sidebar';
import Header from '@/Components/Layout/Header';

declare function route(name: string, params?: any): string;

interface Pengumuman {
    id: number;
    judul: string;
    isi: string;
    target_role: string;
    created_at: string;
}

interface Stats {
    total_readers: number;
}

interface Props {
    pengumuman: Pengumuman;
    stats: Stats;
}

export default function Show({ pengumuman, stats }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    const getTargetBadge = (target: string) => {
        const badges: Record<string, string> = {
            'Admin': 'bg-purple-100 text-purple-800',
            'Dosen': 'bg-blue-100 text-blue-800',
            'Mahasiswa': 'bg-green-100 text-green-800',
            'Semua': 'bg-gray-100 text-gray-800'
        };
        return badges[target] || badges['Semua'];
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
                    title={pengumuman.judul}
                    subtitle="Detail pengumuman"
                />
                <Head title={pengumuman.judul} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <h1 className="text-3xl font-bold text-gray-800">
                                            {pengumuman.judul}
                                        </h1>
                                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${getTargetBadge(pengumuman.target_role)}`}>
                                            {pengumuman.target_role}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        Dibuat pada: {new Date(pengumuman.created_at).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                                <Link
                                    href={route('admin.pengumuman.index')}
                                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                >
                                    Kembali
                                </Link>
                            </div>

                            {/* Statistics */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    <span className="text-sm text-gray-700">
                                        <strong className="font-semibold">{stats.total_readers}</strong> orang telah membaca pengumuman ini
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="prose max-w-none">
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                        {pengumuman.isi}
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                                <Link
                                    href={route('admin.pengumuman.edit', pengumuman.id)}
                                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                                >
                                    Edit Pengumuman
                                </Link>
                                <Link
                                    href={route('admin.pengumuman.index')}
                                    as="button"
                                    method="delete"
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                    onClick={(e) => {
                                        if (!confirm('Apakah Anda yakin ingin menghapus pengumuman ini?')) {
                                            e.preventDefault();
                                        }
                                    }}
                                >
                                    Hapus Pengumuman
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </main>
            </div>
        </div>
    );
}
