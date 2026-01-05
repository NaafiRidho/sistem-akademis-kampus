import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';

interface FakultasFormData {
    nama_fakultas: string;
}

interface FakultasFormModalProps {
    show: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    formData: FakultasFormData;
    setFormData: (data: any) => void;
    isEdit: boolean;
}

export default function FakultasFormModal({
    show,
    onClose,
    onSubmit,
    formData,
    setFormData,
    isEdit
}: FakultasFormModalProps) {
    const { register, handleSubmit, formState: { errors }, reset } = useForm<FakultasFormData>({
        defaultValues: formData
    });

    useEffect(() => {
        if (show) {
            reset(formData);
        }
    }, [show, formData, reset]);

    if (!show) return null;

    const handleFormSubmit = (data: FakultasFormData) => {
        Object.assign(formData, data);
        setFormData(data);
        onSubmit({ preventDefault: () => {} } as React.FormEvent);
    };

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
                    onClose();
                }
            }}
        >
            <div 
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                <form onSubmit={handleSubmit(handleFormSubmit)}>
                    <div className="px-6 pt-6 pb-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {isEdit ? 'Edit Fakultas' : 'Tambah Fakultas'}
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
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Nama Fakultas <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        {...register('nama_fakultas', { required: 'Nama fakultas wajib diisi' })}
                                        className="w-full px-4 py-3 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="Contoh: Fakultas Teknik"
                                    />
                                    {errors.nama_fakultas && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.nama_fakultas.message}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 sm:flex sm:flex-row-reverse gap-3">
                            <button
                                type="submit"
                                className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                {isEdit ? 'Update' : 'Simpan'}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-base font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Batal
                            </button>
                        </div>
                    </form>
                </div>
        </div>,
        document.body
    );
}
