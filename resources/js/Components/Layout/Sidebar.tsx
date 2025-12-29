export default function Sidebar({ sidebarOpen, setSidebarOpen, activeMenu = 'dashboard' }) {
    const menuItems = [
        {
            name: 'Dashboard',
            path: '/admin/dashboard',
            icon: 'M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z',
            key: 'dashboard'
        },
        {
            name: 'Mahasiswa',
            path: '/admin/mahasiswa',
            icon: 'M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z',
            key: 'mahasiswa'
        },
        {
            name: 'Dosen',
            path: '/admin/dosen',
            icon: 'M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z',
            key: 'dosen'
        },
        {
            name: 'Fakultas & Prodi',
            path: '/admin/fakultas',
            icon: 'M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z',
            key: 'fakultas'
        }
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
                <div className="h-full px-3 py-4 overflow-y-auto">
                {/* Logo */}
                <div className="flex items-center justify-center mb-8 p-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold text-gray-800 dark:text-white">Admin Panel</span>
                    </div>
                </div>

                {/* Navigation */}
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
            </aside>
        </>
    );
}
