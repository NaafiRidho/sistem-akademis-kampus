import { useEffect, useState } from 'react';

interface ToastProps {
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    details?: string[];
    onClose: () => void;
    duration?: number;
}

export default function Toast({ type, message, details, onClose, duration = 5000 }: ToastProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        console.log('Toast mounted with:', { type, message, details });
        
        // Trigger animation
        setTimeout(() => {
            console.log('Setting toast visible');
            setIsVisible(true);
        }, 10);

        // Progress bar animation
        const interval = setInterval(() => {
            setProgress((prev) => {
                const newProgress = prev - (100 / (duration / 100));
                if (newProgress <= 0) {
                    clearInterval(interval);
                    return 0;
                }
                return newProgress;
            });
        }, 100);

        // Auto close
        const timer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };
    }, [duration]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation to complete
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return (
                    <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                );
            case 'error':
                return (
                    <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                );
            case 'warning':
                return (
                    <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                );
            case 'info':
                return (
                    <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                );
        }
    };

    const getColors = () => {
        switch (type) {
            case 'success':
                return {
                    bg: 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900',
                    border: 'border-green-500',
                    text: 'text-green-700 dark:text-green-200',
                    progress: 'bg-green-500'
                };
            case 'error':
                return {
                    bg: 'bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900 dark:to-pink-900',
                    border: 'border-red-500',
                    text: 'text-red-700 dark:text-red-200',
                    progress: 'bg-red-500'
                };
            case 'warning':
                return {
                    bg: 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900 dark:to-orange-900',
                    border: 'border-yellow-500',
                    text: 'text-yellow-700 dark:text-yellow-200',
                    progress: 'bg-yellow-500'
                };
            case 'info':
                return {
                    bg: 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900',
                    border: 'border-blue-500',
                    text: 'text-blue-700 dark:text-blue-200',
                    progress: 'bg-blue-500'
                };
        }
    };

    const colors = getColors();

    console.log('Toast rendering with isVisible:', isVisible);

    return (
        <div
            className={`fixed top-4 right-4 transition-all duration-300 transform ${
                isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
            }`}
            style={{ 
                maxWidth: '400px',
                zIndex: 9999,
                pointerEvents: 'auto'
            }}
        >
            <div className={`${colors.bg} border-l-4 ${colors.border} rounded-lg shadow-2xl overflow-hidden`}>
                <div className="p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            {getIcon()}
                        </div>
                        <div className="ml-3 flex-1">
                            <p className={`text-sm font-semibold ${colors.text}`}>
                                {message}
                            </p>
                            {details && details.length > 0 && (
                                <div className="mt-2 text-xs">
                                    <details className={colors.text}>
                                        <summary className="cursor-pointer font-medium hover:underline">
                                            Lihat detail ({details.length} error)
                                        </summary>
                                        <ul className="mt-2 list-disc list-inside space-y-1 max-h-40 overflow-y-auto">
                                            {details.slice(0, 10).map((detail, index) => (
                                                <li key={index}>{detail}</li>
                                            ))}
                                            {details.length > 10 && (
                                                <li className="font-semibold">
                                                    ... dan {details.length - 10} error lainnya
                                                </li>
                                            )}
                                        </ul>
                                    </details>
                                </div>
                            )}
                        </div>
                        <div className="ml-4 flex-shrink-0">
                            <button
                                onClick={handleClose}
                                className={`inline-flex rounded-md ${colors.text} hover:opacity-75 focus:outline-none transition-opacity`}
                            >
                                <span className="sr-only">Close</span>
                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                {/* Progress bar */}
                <div className="h-1 bg-gray-200 dark:bg-gray-700">
                    <div
                        className={`h-full ${colors.progress} transition-all duration-100 ease-linear`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
