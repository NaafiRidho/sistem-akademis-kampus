import React from 'react';
import { createPortal } from 'react-dom';

interface MataKuliahFormModalProps {
    show: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    formData: {
        kode_mk: string;
        nama_mk: string;
        sks: string;
        prodi_id: string;
    };
    setFormData: React.Dispatch<React.SetStateAction<{
        kode_mk: string;
        nama_mk: string;
        sks: string;
        prodi_id: string;
    }>>;
    prodi: Array<{
        id: number;
        nama_prodi: string;
        fakultas: {
            nama_fakultas: string;
        };
    }>;
    isEdit: boolean;
    isLoading?: boolean;
}

export default function MataKuliahFormModal({
    show,
    onClose,
    onSubmit,
    formData,
    setFormData,
    prodi,
    isEdit,
    isLoading = false
}: MataKuliahFormModalProps) {
    console.log('🚀 MataKuliahFormModal - show:', show, 'isLoading:', isLoading);
    
    if (!show) return null;

    console.log('✅ MataKuliahModal RENDERING via Portal');

    return createPortal(
        <div 
            className="fixed inset-0 z-[9999] overflow-y-auto"
            style={{ 
                backgroundColor: 'rgba(0,0,0,0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    console.log('🔴 Overlay clicked - closing');
                    onClose();
                }
            }}
        >
            <div 
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                <form onSubmit={onSubmit}>
                    <div className="px-6 pt-6 pb-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {isEdit ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah'}
                            </h3>
                            <button
                                type="button"
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Kode Mata Kuliah <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.kode_mk}
                                    onChange={(e) => setFormData({ ...formData, kode_mk: e.target.value })}
                                    className="w-full px-4 py-3 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Contoh: TIF101"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Nama Mata Kuliah <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.nama_mk}
                                    onChange={(e) => setFormData({ ...formData, nama_mk: e.target.value })}
                                    className="w-full px-4 py-3 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Contoh: Pemrograman Dasar"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    SKS <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="6"
                                value={formData.sks}
                                onChange={(e) => setFormData({ ...formData, sks: e.target.value })}
                                className="w-full px-4 py-3 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                placeholder="1-6"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Program Studi <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.prodi_id}
                                onChange={(e) => setFormData({ ...formData, prodi_id: e.target.value })}
                                className="w-full px-4 py-3 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                required
                            >
                                <option value="">Pilih Program Studi</option>
                                {prodi.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.nama_prodi} - {p.fakultas.nama_fakultas}
                                    </option>
                                ))}
                            </select>
                        </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isLoading}
                                className="px-6 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                            >
                                {isLoading && (
                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                                {isLoading ? 'Menyimpan...' : (isEdit ? 'Perbarui' : 'Simpan')}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
