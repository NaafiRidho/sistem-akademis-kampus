import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function LoadingBar() {
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);

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
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998] flex items-center justify-center">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 flex flex-col items-center space-y-4 transform animate-pulse">
                    {/* Spinner */}
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    
                    {/* Text */}
                    <div className="text-center">
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            Memproses...
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Mohon tunggu sebentar
                        </p>
                    </div>
                    
                    {/* Progress Text */}
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-300">
                        {progress.toFixed(0)}%
                    </div>
                </div>
            </div>
        </>
    );
}
