import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';

interface WelcomeProps {
    appName: string;
    stats?: {
        fakultas?: number;
        prodi?: number;
        dosen?: number;
        mahasiswa?: number;
    };
}

export default function Welcome({ appName, stats }: WelcomeProps) {
    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme');
            
            // If no saved preference, use system preference
            if (!savedTheme) {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                return prefersDark;
            }
            
            // Use saved preference
            return savedTheme === 'dark';
        }
        return false;
    });

    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        // Listen to system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            const savedTheme = localStorage.getItem('theme');
            // Only auto-update if user hasn't manually set a preference
            if (!savedTheme) {
                setDarkMode(e.matches);
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const toggleDarkMode = () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);
        localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
    };

    return (
        <>
            <Head title="Beranda" />
            
            {/* Background with animated gradient */}
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-blue-950 dark:to-purple-950 relative overflow-hidden">
                {/* Animated background blobs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob"></div>
                    <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-300 dark:bg-pink-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
                </div>

                {/* Navbar with glass effect */}
                <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${
                    scrolled 
                        ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg' 
                        : 'bg-transparent'
                }`}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16 sm:h-20">
                            <div className="flex items-center space-x-2 sm:space-x-3">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
                                    <span className="text-xl sm:text-2xl">🎓</span>
                                </div>
                                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    {appName}
                                </h1>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-4">
                                <button
                                    onClick={toggleDarkMode}
                                    className="p-2 sm:p-3 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-300 shadow-md hover:shadow-xl group"
                                    aria-label="Toggle dark mode"
                                >
                                    {darkMode ? (
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 group-hover:rotate-180 transition-transform duration-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 group-hover:rotate-12 transition-transform duration-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                                        </svg>
                                    )}
                                </button>
                                
                                <a href="/login" className="relative group overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 sm:px-8 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105">
                                    <span className="relative z-10">Login</span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </a>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <div className="relative pt-20 pb-12 sm:pt-32 sm:pb-20 md:pt-40 md:pb-32">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <div className="inline-block mb-4 sm:mb-6 px-4 sm:px-6 py-1.5 sm:py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                                <span className="text-blue-600 dark:text-blue-400 font-semibold text-xs sm:text-sm">✨ Platform Terpercaya & Modern</span>
                            </div>
                            
                            <h2 className="text-3xl sm:text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white mb-4 sm:mb-6 leading-tight px-4">
                                Sistem Manajemen
                                <span className="block mt-1 sm:mt-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
                                    Akademik Terpadu
                                </span>
                            </h2>
                            
                            <p className="text-base sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed px-4">
                                Platform digital terintegrasi untuk mengelola seluruh aktivitas akademik kampus dengan 
                                <span className="font-semibold text-blue-600 dark:text-blue-400"> mudah</span>,
                                <span className="font-semibold text-purple-600 dark:text-purple-400"> efisien</span>, dan
                                <span className="font-semibold text-pink-600 dark:text-pink-400"> modern</span>.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
                                <a href="/login" className="group relative w-full sm:w-auto overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 shadow-2xl hover:shadow-blue-500/50 hover:scale-105">
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        Mulai Sekarang
                                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </a>
                                
                                <a href="#features" className="group w-full sm:w-auto bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-8 sm:px-10 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                                    <span className="flex items-center justify-center gap-2">
                                        Pelajari Lebih Lanjut
                                        <svg className="w-5 h-5 group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats with glass morphism */}
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                        {[
                            { value: stats?.fakultas || 7, label: 'Fakultas', color: 'from-blue-500 to-cyan-500', icon: '🏛️', delay: '0' },
                            { value: stats?.prodi || 19, label: 'Program Studi', color: 'from-purple-500 to-pink-500', icon: '📚', delay: '100' },
                            { value: stats?.dosen || 20, label: 'Dosen', color: 'from-green-500 to-emerald-500', icon: '👨‍🏫', delay: '200' },
                            { value: stats?.mahasiswa || 50, label: 'Mahasiswa', color: 'from-orange-500 to-red-500', icon: '🎓', delay: '300' },
                        ].map((stat, index) => (
                            <div key={index} className="group relative">
                                <div className="absolute -inset-0.5 bg-gradient-to-r opacity-75 group-hover:opacity-100 blur transition duration-300 rounded-xl sm:rounded-2xl" style={{backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`}}></div>
                                <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl p-4 sm:p-8 rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:scale-105 transform">
                                    <div className="flex items-center justify-between mb-2 sm:mb-4">
                                        <div className={`text-2xl sm:text-4xl transform group-hover:scale-110 transition-transform duration-300 group-hover:rotate-12`}>
                                            {stat.icon}
                                        </div>
                                        <div className={`px-2 sm:px-3 py-0.5 sm:py-1 bg-gradient-to-r ${stat.color} text-white text-[10px] sm:text-xs font-bold rounded-full`}>
                                            LIVE
                                        </div>
                                    </div>
                                    <div className={`text-3xl sm:text-5xl font-extrabold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-1 sm:mb-2`}>
                                        {stat.value}
                                    </div>
                                    <div className="text-gray-600 dark:text-gray-300 font-semibold text-[10px] sm:text-sm uppercase tracking-wide">
                                        {stat.label}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Features with hover effects */}
                <div id="features" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
                    <div className="text-center mb-8 sm:mb-16">
                        <span className="inline-block px-4 sm:px-6 py-1.5 sm:py-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full text-blue-600 dark:text-blue-400 font-semibold text-xs sm:text-sm mb-3 sm:mb-4">
                            FITUR UNGGULAN
                        </span>
                        <h3 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-3 sm:mb-4 px-4">
                            Kenapa Memilih <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Kami?</span>
                        </h3>
                        <p className="text-base sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
                            Solusi lengkap untuk manajemen akademik modern dengan fitur-fitur canggih
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
                        {[
                            { icon: '📚', title: 'Manajemen Mata Kuliah', desc: 'Kelola mata kuliah, silabus, dan materi pembelajaran dengan sistem yang terorganisir.', gradient: 'from-blue-500 to-cyan-500' },
                            { icon: '📅', title: 'Jadwal Kuliah', desc: 'Susun dan kelola jadwal perkuliahan dengan mudah, termasuk pengaturan ruangan dan waktu.', gradient: 'from-purple-500 to-pink-500' },
                            { icon: '✅', title: 'Absensi Digital', desc: 'Catat kehadiran mahasiswa secara digital dengan sistem yang akurat dan real-time.', gradient: 'from-green-500 to-emerald-500' },
                            { icon: '📊', title: 'Nilai & Evaluasi', desc: 'Input dan pantau nilai mahasiswa dengan sistem grading yang transparan dan terstruktur.', gradient: 'from-yellow-500 to-orange-500' },
                            { icon: '📝', title: 'Tugas & Materi', desc: 'Upload materi pembelajaran dan kelola pengumpulan tugas mahasiswa secara online.', gradient: 'from-red-500 to-pink-500' },
                            { icon: '📢', title: 'Pengumuman', desc: 'Sampaikan informasi penting kepada civitas akademika dengan sistem notifikasi terpusat.', gradient: 'from-indigo-500 to-purple-500' },
                        ].map((feature, index) => (
                            <div key={index} className="group relative">
                                <div className={`absolute -inset-0.5 bg-gradient-to-r ${feature.gradient} rounded-xl sm:rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-300`}></div>
                                <div className="relative bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 h-full border border-gray-100 dark:border-gray-700 hover:-translate-y-2">
                                    <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${feature.gradient} rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                                        <span className="text-2xl sm:text-3xl">{feature.icon}</span>
                                    </div>
                                    <h4 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                                        {feature.title}
                                    </h4>
                                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                                        {feature.desc}
                                    </p>
                                    <div className={`mt-4 sm:mt-6 inline-flex items-center text-xs sm:text-sm font-semibold bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent group-hover:gap-2 transition-all duration-300`}>
                                        Pelajari Lebih Lanjut
                                        <svg className="w-4 h-4 ml-1 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA Section with gradient */}
                <div className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="relative max-w-5xl mx-auto text-center px-4 py-16 sm:py-24">
                        <div className="inline-block mb-4 sm:mb-6 px-4 sm:px-6 py-1.5 sm:py-2 bg-white/20 backdrop-blur-sm rounded-full">
                            <span className="text-white font-semibold text-xs sm:text-sm">🚀 BERGABUNG SEKARANG</span>
                        </div>
                        <h3 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-white mb-4 sm:mb-6 leading-tight">
                            Siap Untuk Memulai<br />Perjalanan Digital?
                        </h3>
                        <p className="text-base sm:text-xl md:text-2xl text-white/90 mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed">
                            Bergabunglah dengan <span className="font-bold">ribuan pengguna</span> yang telah merasakan kemudahan mengelola akademik dengan sistem kami.
                        </p>
                        <a href="/register" className="group inline-flex items-center gap-2 sm:gap-3 bg-white text-blue-600 px-8 sm:px-12 py-3.5 sm:py-5 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg hover:bg-gray-100 transition-all duration-300 shadow-2xl hover:shadow-white/50 hover:scale-105">
                            Daftar Sekarang - Gratis!
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </a>
                        <p className="mt-4 sm:mt-6 text-white/80 text-xs sm:text-sm">
                            ⭐⭐⭐⭐⭐ Dipercaya oleh lebih dari 1000+ institusi pendidikan
                        </p>
                    </div>
                </div>

                {/* Footer with gradient */}
                <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-black dark:via-gray-950 dark:to-black text-gray-300 py-12 sm:py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-12 mb-8 sm:mb-12">
                            <div className="md:col-span-2">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                        <span className="text-2xl">🎓</span>
                                    </div>
                                    <h4 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                        {appName}
                                    </h4>
                                </div>
                                <p className="text-gray-400 leading-relaxed max-w-md mb-6">
                                    Sistem Manajemen Akademik Kampus yang dirancang untuk memudahkan pengelolaan seluruh aktivitas akademik dengan teknologi terkini.
                                </p>
                                <div className="flex gap-4">
                                    {['facebook', 'twitter', 'instagram', 'linkedin'].map((social, i) => (
                                        <a key={i} href="#" className="w-10 h-10 bg-gray-800 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110">
                                            <span className="text-xl">
                                                {social === 'facebook' && '📘'}
                                                {social === 'twitter' && '🐦'}
                                                {social === 'instagram' && '📸'}
                                                {social === 'linkedin' && '💼'}
                                            </span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-white text-lg font-bold mb-6">Menu Cepat</h4>
                                <ul className="space-y-3">
                                    {['Beranda', 'Fitur', 'Login', 'Daftar'].map((item, i) => (
                                        <li key={i}>
                                            <a href={item === 'Beranda' ? '#' : item === 'Fitur' ? '#features' : `/${item.toLowerCase()}`} 
                                               className="text-gray-400 hover:text-white hover:translate-x-2 inline-block transition-all duration-300">
                                                → {item}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-white text-lg font-bold mb-6">Hubungi Kami</h4>
                                <ul className="space-y-4 text-gray-400">
                                    <li className="flex items-start gap-3">
                                        <span className="text-xl">📧</span>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Email</p>
                                            <a href="mailto:info@kampus.ac.id" className="hover:text-blue-400 transition">info@kampus.ac.id</a>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-xl">📞</span>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Telepon</p>
                                            <a href="tel:+622112345678" className="hover:text-blue-400 transition">(021) 1234-5678</a>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-xl">📍</span>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Lokasi</p>
                                            <p>Jakarta, Indonesia</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="border-t border-gray-800 pt-8">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                <p className="text-gray-500 text-sm">
                                    &copy; 2024 Sistem Akademis Kampus. All rights reserved.
                                </p>
                                <div className="flex gap-6 text-sm text-gray-500">
                                    <a href="#" className="hover:text-white transition">Privacy Policy</a>
                                    <a href="#" className="hover:text-white transition">Terms of Service</a>
                                    <a href="#" className="hover:text-white transition">Cookie Policy</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
