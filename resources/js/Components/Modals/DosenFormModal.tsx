import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import LoadingButton from '../LoadingButton';

interface DosenFormData {
    nidn: string;
    nama: string;
    email: string;
    no_telepon?: string;
    pendidikan_terakhir?: string;
    prodi_id?: string;
    password: string;
}

interface DosenFormModalProps {
    show: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    formData: DosenFormData;
    prodis: Array<{ id: number; nama_prodi: string; fakultas?: { nama_fakultas: string } }>;
    isEdit?: boolean;
    loading?: boolean;
}

export default function DosenFormModal({ show, onClose, onSubmit, formData, prodis, isEdit = false, loading = false }: DosenFormModalProps) {
    const { register, handleSubmit, formState: { errors }, reset } = useForm<DosenFormData>({
        defaultValues: formData
    });

    useEffect(() => {
        if (show) {
            reset(formData);
        }
    }, [show, formData, reset]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (show) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [show]);

    // Handle Escape key to close modal
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && show && !loading) {
                onClose();
            }
        };
        
        if (show) {
            document.addEventListener('keydown', handleEscape);
        }
        
        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [show, onClose, loading]);

    if (!show) return null;

    const handleFormSubmit = (data: DosenFormData) => {
        const e = { preventDefault: () => {} } as React.FormEvent;
        Object.assign(formData, data);
        onSubmit(e);
    };

    return createPortal(
        <>
            <style>{`
                .modal-no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
            <div 
                className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
                onClick={(e) => {
                    if (e.target === e.currentTarget && !loading) {
                        onClose();
                    }
                }}
            >
                <div 
                    className="modal-no-scrollbar bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
                style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch'
                } as React.CSSProperties & { WebkitOverflowScrolling?: string }}
            >
                <form onSubmit={handleSubmit(handleFormSubmit)}>
                    <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700 z-10">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {isEdit ? 'Edit Data Dosen' : 'Tambah Data Dosen'}
                            </h3>
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">NIDN <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    {...register('nidn', { required: 'NIDN wajib diisi' })}
                                    className="w-full px-4 py-3 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Nomor NIDN"
                                />
                                {errors.nidn && <p className="mt-1 text-xs text-red-500">{errors.nidn.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nama <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    {...register('nama', { required: 'Nama wajib diisi' })}
                                    className="w-full px-4 py-3 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Nama lengkap dosen"
                                />
                                {errors.nama && <p className="mt-1 text-xs text-red-500">{errors.nama.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email <span className="text-red-500">*</span></label>
                                <input
                                    type="email"
                                    {...register('email', { 
                                        required: 'Email wajib diisi',
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: 'Format email tidak valid'
                                        }
                                    })}
                                    className="w-full px-4 py-3 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="email@example.com"
                                />
                                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">No. Telepon</label>
                                <input
                                    type="text"
                                    {...register('no_telepon')}
                                    className="w-full px-4 py-3 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="08xxxxxxxxxx"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pendidikan Terakhir</label>
                                <select
                                    {...register('pendidikan_terakhir')}
                                    className="w-full px-4 py-3 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="">Pilih Pendidikan</option>
                                    <option value="S1">S1</option>
                                    <option value="S2">S2</option>
                                    <option value="S3">S3</option>
                                    <option value="Profesor">Profesor</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Program Studi Mengajar</label>
                                <select
                                    {...register('prodi_id')}
                                    className="w-full px-4 py-3 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="">Pilih Prodi</option>
                                    {prodis?.map((prodi) => (
                                        <option key={prodi.id} value={prodi.id}>
                                            {prodi.nama_prodi} - {prodi.fakultas?.nama_fakultas}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Password {!isEdit && <span className="text-red-500">*</span>}
                                    {isEdit && <span className="text-xs text-gray-500">(kosongkan jika tidak diubah)</span>}
                                </label>
                                <input
                                    type="password"
                                    {...register('password', { 
                                        required: !isEdit ? 'Password wajib diisi' : false,
                                        minLength: { value: 6, message: 'Password minimal 6 karakter' }
                                    })}
                                    className="w-full px-4 py-3 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Minimal 6 karakter"
                                />
                                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
                            </div>
                        </div>
                    </div>
                    <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t border-gray-200 dark:border-gray-600 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-base font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Batal
                        </button>
                        <LoadingButton
                            type="submit"
                            loading={loading}
                            disabled={loading}
                            className="w-full sm:w-auto px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200"
                        >
                            {isEdit ? 'Update' : 'Simpan'}
                        </LoadingButton>
                    </div>
                </form>
            </div>
        </div>
        </>,
        document.body
    );
}
