import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
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

interface PaginatedData {
    data: Pengumuman[];
    links?: { url: string | null; label: string; active: boolean }[];
}

interface Filters {
    search: string;
    target_role: string;
}

interface Props {
    pengumuman: PaginatedData;
    filters: Filters;
}

export default function Index({ pengumuman, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [targetRole, setTargetRole] = useState(filters.target_role || '');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.pengumuman.index'), { search, target_role: targetRole }, {
            preserveState: true,
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus pengumuman ini?')) {
            router.delete(route('admin.pengumuman.destroy', id));
        }
    };

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
                    title="Kelola Pengumuman"
                    subtitle="Manajemen pengumuman kampus"
                />
                <Head title="Kelola Pengumuman" />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
                    <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Kelola Pengumuman</h2>
                                <Link
                                    href={route('admin.pengumuman.create')}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    + Buat Pengumuman
                                </Link>
                            </div>

                            {/* Filters */}
                            <form onSubmit={handleSearch} className="mb-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <input
                                        type="text"
                                        placeholder="Cari pengumuman..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                    <select
                                        value={targetRole}
                                        onChange={(e) => setTargetRole(e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Semua Target</option>
                                        <option value="Admin">Admin</option>
                                        <option value="Dosen">Dosen</option>
                                        <option value="Mahasiswa">Mahasiswa</option>
                                        <option value="Semua">Semua</option>
                                    </select>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                    >
                                        Cari
                                    </button>
                                </div>
                            </form>

                            {/* Pengumuman List */}
                            <div className="space-y-4">
                                {pengumuman.data.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        Belum ada pengumuman
                                    </div>
                                ) : (
                                    pengumuman.data.map((item) => (
                                        <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h3 className="text-lg font-semibold text-gray-800">
                                                            {item.judul}
                                                        </h3>
                                                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getTargetBadge(item.target_role)}`}>
                                                            {item.target_role}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                                                        {item.isi}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        {new Date(item.created_at).toLocaleDateString('id-ID', {
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2 ml-4">
                                                    <Link
                                                        href={route('admin.pengumuman.show', item.id)}
                                                        className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                                                    >
                                                        Lihat
                                                    </Link>
                                                    <Link
                                                        href={route('admin.pengumuman.edit', item.id)}
                                                        className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                                                    >
                                                        Hapus
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Pagination */}
                            {pengumuman.links && pengumuman.links.length > 3 && (
                                <div className="flex justify-center gap-2 mt-6">
                                    {pengumuman.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`px-4 py-2 rounded ${
                                                link.active
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    </div>
                </div>
            </main>
        </div>
    </div>
    );
}
