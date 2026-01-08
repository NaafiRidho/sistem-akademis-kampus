import React from 'react';
import { createPortal } from 'react-dom';

interface EditStatusAbsensiModalProps {
    show: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    formData: {
        status: string;
        keterangan: string;
    };
    setFormData: (data: any) => void;
    mahasiswaInfo: {
        nama: string;
        nim: string;
    };
    jadwalInfo: {
        mata_kuliah: string;
        hari: string;
        jam: string;
    };
    tanggal: string;
    isLoading?: boolean;
}

export default function EditStatusAbsensiModal({
    show,
    onClose,
    onSubmit,
    formData,
    setFormData,
    mahasiswaInfo,
    jadwalInfo,
    tanggal,
    isLoading = false
}: EditStatusAbsensiModalProps) {
    if (!show) return null;

    const statusOptions = [
        { 
            value: 'Hadir', 
            label: 'Hadir', 
            color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
            )
        },
        { 
            value: 'Izin', 
            label: 'Izin', 
            color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
            )
        },
        { 
            value: 'Sakit', 
            label: 'Sakit', 
            color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
            )
        },
        { 
            value: 'Alpa', 
            label: 'Alpa', 
            color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
            )
        }
    ];

    return createPortal(
        <div 
            className="fixed inset-0 z-[9999] overflow-y-auto"
            style={{ 
                backgroundColor: 'rgba(0,0,0,0.75)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget && !isLoading) {
                    onClose();
                }
            }}
        >
            <div 
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <form onSubmit={onSubmit}>
                    {/* Header */}
                    <div className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        Edit Status Absensi
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        Ubah status kehadiran mahasiswa
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isLoading}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Info Section */}
                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Mahasiswa</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{mahasiswaInfo.nama}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">{mahasiswaInfo.nim}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Tanggal</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {new Date(tanggal).toLocaleDateString('id-ID', { 
                                        weekday: 'long', 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                    })}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Mata Kuliah</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{jadwalInfo.mata_kuliah}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Jadwal</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{jadwalInfo.hari}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">{jadwalInfo.jam}</p>
                            </div>
                        </div>
                    </div>

                    {/* Form Section */}
                    <div className="px-6 py-6 space-y-6">
                        {/* Status Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                Status Kehadiran <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {statusOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, status: option.value })}
                                        disabled={isLoading}
                                        className={`
                                            relative p-4 rounded-xl border-2 transition-all duration-200
                                            ${formData.status === option.value 
                                                ? `${option.color} border-current shadow-lg scale-105` 
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                                            }
                                            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                                        `}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`
                                                flex items-center justify-center w-10 h-10 rounded-lg
                                                ${formData.status === option.value ? 'bg-white/20' : option.color}
                                            `}>
                                                {option.icon}
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className={`
                                                    font-semibold text-base
                                                    ${formData.status === option.value 
                                                        ? '' 
                                                        : 'text-gray-700 dark:text-gray-300'
                                                    }
                                                `}>
                                                    {option.label}
                                                </p>
                                            </div>
                                            {formData.status === option.value && (
                                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Keterangan */}
                        {formData.status && formData.status !== 'Hadir' && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Keterangan {formData.status === 'Izin' || formData.status === 'Sakit' ? <span className="text-red-500">*</span> : '(Opsional)'}
                                </label>
                                <textarea
                                    value={formData.keterangan}
                                    onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                                    className="w-full px-4 py-3 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    rows={4}
                                    placeholder={`Masukkan keterangan ${formData.status.toLowerCase()}...`}
                                    required={formData.status === 'Izin' || formData.status === 'Sakit'}
                                    disabled={isLoading}
                                />
                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    {formData.status === 'Izin' && 'Harap masukkan alasan izin (misalnya: Keperluan keluarga, acara penting, dll)'}
                                    {formData.status === 'Sakit' && 'Harap masukkan keterangan sakit (misalnya: Demam, flu, dll)'}
                                    {formData.status === 'Alpa' && 'Keterangan opsional untuk status Alpa'}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={!formData.status || ((formData.status === 'Izin' || formData.status === 'Sakit') && !formData.keterangan) || isLoading}
                            className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Menyimpan...</span>
                                </>
                            ) : (
                                'Simpan Perubahan'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
