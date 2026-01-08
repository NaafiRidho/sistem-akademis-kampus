interface SidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    activeMenu?: string;
}

export default function DosenSidebar({ sidebarOpen, setSidebarOpen, activeMenu = 'dashboard' }: SidebarProps) {
    const menuItems = [
        {
            name: 'Dashboard',
            path: '/dosen/dashboard',
            icon: 'M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z',
            key: 'dashboard'
        },
        {
            name: 'Jadwal Mengajar',
            path: '/dosen/jadwal',
            icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
            key: 'jadwal'
        },
        {
            name: 'Kelas',
            path: '/dosen/kelas',
            icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
            key: 'kelas'
        },
        {
            name: 'Kelola Nilai',
            path: '/dosen/nilai',
            icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
            key: 'nilai'
        },
        {
            name: 'Kelola Absensi',
            path: '/dosen/absensi',
            icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
            key: 'absensi'
        },
        {
            name: 'Materi Kuliah',
            path: '/dosen/materi',
            icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
            key: 'materi'
        },
        {
            name: 'Tugas',
            path: '/dosen/tugas',
            icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
            key: 'tugas'
        },
    ];

    return (
        <>
            {/* Overlay untuk mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            
            <aside className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700`}>
                <div className="h-full flex flex-col">
                    {/* Logo */}
                    <div className="flex items-center justify-center mb-6 p-4 flex-shrink-0">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold text-gray-800 dark:text-white">Portal Dosen</span>
                        </div>
                    </div>

                    {/* Navigation - Scrollable */}
                    <div className="flex-1 overflow-y-auto px-3 pb-4">
                        <ul className="space-y-2 font-medium">
                            {menuItems.map((item) => (
                                <li key={item.key}>
                                    <a
                                        href={item.path}
                                        className={`flex items-center p-3 rounded-lg group ${
                                            activeMenu === item.key
                                                ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600'
                                                : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        <svg
                                            className={`w-5 h-5 ${
                                                activeMenu === item.key
                                                    ? 'text-white'
                                                    : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'
                                            }`}
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d={item.icon} fillRule="evenodd" clipRule="evenodd" />
                                        </svg>
                                        <span className="ml-3">{item.name}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </aside>
        </>
    );
}
