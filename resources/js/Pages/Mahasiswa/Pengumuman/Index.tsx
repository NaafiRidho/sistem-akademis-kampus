import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MahasiswaSidebar from '@/Components/Layout/MahasiswaSidebar';
import Header from '@/Components/Layout/Header';

declare function route(name: string, params?: any): string;

interface Pengumuman {
    id: number;
    judul: string;
    isi: string;
    target_role: string;
    created_at: string;
    isRead: boolean;
}

interface PaginatedData {
    data: Pengumuman[];
    links?: { url: string | null; label: string; active: boolean }[];
}

interface Filters {
    search: string;
    unread: string;
}

interface Props {
    pengumuman: PaginatedData;
    unreadCount: number;
    filters: Filters;
}

export default function Index({ pengumuman, unreadCount, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [showUnreadOnly, setShowUnreadOnly] = useState(filters.unread === 'true');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('mahasiswa.pengumuman.index'), { 
            search, 
            unread: showUnreadOnly ? 'true' : '' 
        }, {
            preserveState: true,
        });
    };

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
                    title="Pengumuman"
                    subtitle="Pengumuman untuk mahasiswa"
                />
                <Head title="Pengumuman" />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
                    <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">Pengumuman</h2>
                                    {unreadCount > 0 && (
                                        <p className="text-sm text-green-600 mt-1">
                                            {unreadCount} pengumuman belum dibaca
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Filters */}
                            <form onSubmit={handleSearch} className="mb-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <input
                                        type="text"
                                        placeholder="Cari pengumuman..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    />
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="unreadOnly"
                                            checked={showUnreadOnly}
                                            onChange={(e) => setShowUnreadOnly(e.target.checked)}
                                            className="mr-2 rounded"
                                        />
                                        <label htmlFor="unreadOnly" className="text-sm text-gray-700">
                                            Hanya yang belum dibaca
                                        </label>
                                    </div>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                    >
                                        Cari
                                    </button>
                                </div>
                            </form>

                            {/* Pengumuman List */}
                            <div className="space-y-4">
                                {pengumuman.data.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        Tidak ada pengumuman
                                    </div>
                                ) : (
                                    pengumuman.data.map((item) => (
                                        <Link
                                            key={item.id}
                                            href={route('mahasiswa.pengumuman.show', item.id)}
                                            className={`block border rounded-lg p-4 hover:shadow-md transition ${
                                                !item.isRead ? 'bg-green-50 border-green-300' : 'bg-white border-gray-200'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {!item.isRead && (
                                                            <span className="px-2 py-1 text-xs font-bold bg-green-600 text-white rounded">
                                                                BARU
                                                            </span>
                                                        )}
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
                                                <svg className="w-5 h-5 text-gray-400 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </Link>
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
                                                    ? 'bg-green-600 text-white'
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
                </main>
            </div>
        </div>
    );
}
