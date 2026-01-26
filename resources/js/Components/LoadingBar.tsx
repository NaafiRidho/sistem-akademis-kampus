import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function LoadingBar() {
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isDark, setIsDark] = useState(false);

    // Detect dark mode from localStorage
    useEffect(() => {
        const checkDarkMode = () => {
            const darkMode = localStorage.getItem('darkMode') === 'true';
            setIsDark(darkMode);
        };

        checkDarkMode();

        // Listen for storage changes (when user toggles dark mode)
        const handleStorageChange = () => checkDarkMode();
        window.addEventListener('storage', handleStorageChange);
        
        // Poll for changes in case same-tab updates don't trigger storage event
        const interval = setInterval(checkDarkMode, 500);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        const startHandler = () => {
            setIsLoading(true);
            setProgress(0);
        };

        const progressHandler = (event: any) => {
            if (event.detail.progress) {
                setProgress(event.detail.progress.percentage);
            }
        };

        const finishHandler = () => {
            setProgress(100);
            setTimeout(() => {
                setIsLoading(false);
                setProgress(0);
            }, 200);
        };

        router.on('start', startHandler);
        router.on('progress', progressHandler);
        router.on('finish', finishHandler);

        return () => {
            router.on('start', startHandler);
            router.on('progress', progressHandler);
            router.on('finish', finishHandler);
        };
    }, []);

    if (!isLoading) return null;

    return (
        <>
            {/* Loading Bar */}
            <div className="fixed top-0 left-0 right-0 z-[9999]">
                <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out shadow-lg"
                     style={{ width: `${progress}%` }}>
                </div>
            </div>

            {/* Loading Overlay */}
            <div className={`fixed inset-0 backdrop-blur-sm z-[9998] flex items-center justify-center ${isDark ? 'bg-black/50' : 'bg-black/30'}`}>
                <div className={`rounded-2xl shadow-2xl p-8 flex flex-col items-center space-y-4 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                    {/* Spinner */}
                    <div className="relative">
                        <div className={`w-16 h-16 border-4 rounded-full ${isDark ? 'border-gray-700' : 'border-gray-200'}`}></div>
                        <div className={`absolute top-0 left-0 w-16 h-16 border-4 border-t-transparent rounded-full animate-spin ${isDark ? 'border-blue-400' : 'border-blue-500'}`}></div>
                    </div>
                    
                    {/* Text */}
                    <div className="text-center">
                        <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Memproses...
                        </p>
                        <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Mohon tunggu sebentar
                        </p>
                    </div>
                    
                    {/* Progress Text */}
                    <div className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {progress.toFixed(0)}%
                    </div>
                </div>
            </div>
        </>
    );
}
