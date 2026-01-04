import { createPortal } from 'react-dom';

interface DeleteConfirmationModalProps {
    show: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    itemName: string;
    isLoading?: boolean;
}

export default function DeleteConfirmationModal({ show, onClose, onConfirm, title, message, itemName, isLoading = false }: DeleteConfirmationModalProps) {
    if (!show) return null;

    return createPortal(
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-start justify-center p-4">
            <div className="relative top-10 md:top-20 mx-auto p-4 md:p-5 border w-full max-w-md shadow-lg rounded-md bg-white dark:bg-gray-800">
                <div className="mt-3 text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
                        <svg className="h-6 w-6 text-red-600 dark:text-red-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mt-4">
                        {title}
                    </h3>
                    <div className="mt-2 px-7 py-3">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {message}
                            <br />
                            <strong className="text-gray-900 dark:text-white">{itemName}</strong>
                            <br />
                            Aksi ini tidak dapat dibatalkan.
                        </p>
                    </div>
                    <div className="flex gap-2 px-4 py-3">
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading && (
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            {isLoading ? 'Menghapus...' : 'Hapus'}
                        </button>
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Batal
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
