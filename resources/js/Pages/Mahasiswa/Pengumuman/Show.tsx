import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import MahasiswaSidebar from '@/Components/Layout/MahasiswaSidebar';
import Header from '@/Components/Layout/Header';

declare function route(name: string, params?: any): string;

interface Pengumuman {
    id: number;
    judul: string;
    isi: string;
    target_role: string;
    created_at: string;
}

interface Props {
    pengumuman: Pengumuman;
}

export default function Show({ pengumuman }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    const getTargetBadge = (target: string) => {
        const badges: Record<string, string> = {
            'Mahasiswa': 'bg-green-100 text-green-800',
            'Semua': 'bg-gray-100 text-gray-800'
        };
        return badges[target] || badges['Semua'];
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <MahasiswaSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
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
                                        {new Date(pengumuman.created_at).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                                <Link
                                    href={route('mahasiswa.pengumuman.index')}
                                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                >
                                    Kembali
                                </Link>
                            </div>

                            {/* Content */}
                            <div className="prose max-w-none">
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                        {pengumuman.isi}
                                    </p>
                                </div>
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
