import React from 'react';

interface LoadingButtonProps {
    loading?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
    onClick?: () => void;
}

export default function LoadingButton({
    loading = false,
    disabled = false,
    children,
    className = '',
    type = 'button',
    onClick
}: LoadingButtonProps) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`relative inline-flex items-center justify-center ${className} ${
                (disabled || loading) ? 'opacity-70 cursor-not-allowed' : ''
            }`}
        >
            {loading && (
                <div className="absolute left-4">
                    <svg
                        className="animate-spin h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                </div>
            )}
            <span className={loading ? 'ml-6' : ''}>{children}</span>
        </button>
    );
}
