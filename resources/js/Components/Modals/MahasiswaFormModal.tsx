import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import LoadingButton from '../LoadingButton';

interface Prodi {
    id: number;
    nama_prodi: string;
    fakultas?: {
        nama_fakultas: string;
    };
}

interface Kelas {
    id: number;
    nama_kelas: string;
    semester: number;
    prodi_id: number;
}

interface MahasiswaFormData {
    nim: string;
    nama: string;
    prodi_id: string;
    kelas_id: string;
    angkatan: string;
    jenis_kelamin: string;
    email: string;
    password: string;
    alamat: string;
}

interface MahasiswaFormModalProps {
    show: boolean;
    onClose: () => void;
    onSubmit: (data: MahasiswaFormData) => void;
    formData: MahasiswaFormData;
    prodis: Prodi[];
    kelas: Kelas[];
    isEdit?: boolean;
    loading?: boolean;
}

export default function MahasiswaFormModal({ 
    show, 
    onClose, 
    onSubmit, 
    formData, 
    prodis, 
    kelas, 
    isEdit = false, 
    loading = false 
}: MahasiswaFormModalProps) {
    const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<MahasiswaFormData>({
        defaultValues: formData
    });

    useEffect(() => {
        if (show) {
            reset(formData);
        }
    }, [show, formData, reset]);

    const prodiId = watch('prodi_id');
    
    // Filter kelas berdasarkan prodi yang dipilih
    // Tambahkan fallback untuk kasus kelas undefined atau null
    // Gunakan == untuk loose comparison agar bisa handle string vs number
    const filteredKelas = prodiId 
        ? (kelas || []).filter((k: Kelas) => k.prodi_id == parseInt(prodiId) || k.prodi_id === parseInt(prodiId))
        : (kelas || []);

    // Reset kelas_id when prodi changes
    useEffect(() => {
        setValue('kelas_id', '');
    }, [prodiId, setValue]);

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

    const handleFormSubmit = (data: MahasiswaFormData) => {
        onSubmit(data);
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
                                {isEdit ? 'Edit Data Mahasiswa' : 'Tambah Data Mahasiswa'}
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
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">NIM <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    {...register('nim', { required: 'NIM wajib diisi' })}
                                    className="w-full px-4 py-3 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Contoh: 123456789"
                                />
                                {errors.nim && <p className="mt-1 text-xs text-red-500">{errors.nim.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nama <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    {...register('nama', { required: 'Nama wajib diisi' })}
                                    className="w-full px-4 py-3 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Nama lengkap"
                                />
                                {errors.nama && <p className="mt-1 text-xs text-red-500">{errors.nama.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Prodi <span className="text-red-500">*</span></label>
                                <select
                                    {...register('prodi_id', { required: 'Prodi wajib dipilih' })}
                                    className="w-full px-4 py-3 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="">Pilih Prodi</option>
                                    {prodis.map((prodi: Prodi) => (
                                        <option key={prodi.id} value={prodi.id}>
                                            {prodi.nama_prodi} - {prodi.fakultas?.nama_fakultas}
                                        </option>
                                    ))}
                                </select>
                                {errors.prodi_id && <p className="mt-1 text-xs text-red-500">{errors.prodi_id.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kelas</label>
                                <select
                                    {...register('kelas_id')}
                                    className="w-full px-4 py-3 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!prodiId}
                                >
                                    <option value="">
                                        {!prodiId ? 'Pilih Prodi Terlebih Dahulu' : 'Pilih Kelas'}
                                    </option>
                                    {filteredKelas?.map((k: Kelas) => (
                                        <option key={k.id} value={k.id}>
                                            {k.nama_kelas} - Semester {k.semester}
                                        </option>
                                    ))}
                                </select>
                                {prodiId && filteredKelas && filteredKelas.length > 0 && (
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        {filteredKelas.length} kelas tersedia
                                    </p>
                                )}
                                {prodiId && (!filteredKelas || filteredKelas.length === 0) && (
                                    <p className="mt-1 text-xs text-amber-500">
                                        ⚠️ Tidak ada kelas untuk prodi ini
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Angkatan <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    {...register('angkatan', { 
                                        required: 'Angkatan wajib diisi',
                                        min: { value: 2000, message: 'Angkatan minimal 2000' }
                                    })}
                                    className="w-full px-4 py-3 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="2024"
                                />
                                {errors.angkatan && <p className="mt-1 text-xs text-red-500">{errors.angkatan.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Jenis Kelamin <span className="text-red-500">*</span></label>
                                <select
                                    {...register('jenis_kelamin', { required: 'Jenis kelamin wajib dipilih' })}
                                    className="w-full px-4 py-3 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="L">Laki-laki</option>
                                    <option value="P">Perempuan</option>
                                </select>
                                {errors.jenis_kelamin && <p className="mt-1 text-xs text-red-500">{errors.jenis_kelamin.message}</p>}
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
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Alamat</label>
                                <textarea
                                    rows={3}
                                    {...register('alamat')}
                                    className="w-full px-4 py-3 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Alamat lengkap (opsional)"
                                />
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
