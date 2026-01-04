import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface NilaiFormModalProps {
    show: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    formData: {
        mahasiswa_id: string;
        mata_kuliah_id: string;
        tugas: string;
        uts: string;
        uas: string;
    };
    setFormData: (data: any) => void;
    mahasiswa: Array<{ id: number; nim: string; nama: string }>;
    mataKuliah: Array<{ id: number; kode_mk: string; nama_mk: string }>;
    isEdit: boolean;
}

export default function NilaiFormModal({
    show,
    onClose,
    onSubmit,
    formData,
    setFormData,
    mahasiswa,
    mataKuliah,
    isEdit
}: NilaiFormModalProps) {
    if (!show) return null;

    const [nilaiAkhir, setNilaiAkhir] = useState(0);
    const [grade, setGrade] = useState('');

    useEffect(() => {
        const tugas = parseFloat(formData.tugas) || 0;
        const uts = parseFloat(formData.uts) || 0;
        const uas = parseFloat(formData.uas) || 0;
        
        const calculated = (tugas * 0.3) + (uts * 0.3) + (uas * 0.4);
        setNilaiAkhir(calculated);

        if (calculated >= 85) setGrade('A');
        else if (calculated >= 70) setGrade('B');
        else if (calculated >= 60) setGrade('C');
        else if (calculated >= 50) setGrade('D');
        else setGrade('E');
    }, [formData.tugas, formData.uts, formData.uas]);

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
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                <form onSubmit={onSubmit}>
                    <div className="px-6 pt-6 pb-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {isEdit ? 'Edit Nilai Mahasiswa' : 'Tambah Nilai Mahasiswa'}
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Mahasiswa <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.mahasiswa_id}
                                    onChange={(e) => setFormData({ ...formData, mahasiswa_id: e.target.value })}
                                    className="w-full px-4 py-3 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                    disabled={isEdit}
                                >
                                    <option value="">Pilih Mahasiswa</option>
                                    {mahasiswa.map((m) => (
                                        <option key={m.id} value={m.id}>
                                            {m.nim} - {m.nama}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Mata Kuliah <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.mata_kuliah_id}
                                    onChange={(e) => setFormData({ ...formData, mata_kuliah_id: e.target.value })}
                                    className="w-full px-4 py-3 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                    disabled={isEdit}
                                >
                                    <option value="">Pilih Mata Kuliah</option>
                                    {mataKuliah.map((mk) => (
                                        <option key={mk.id} value={mk.id}>
                                            {mk.kode_mk} - {mk.nama_mk}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Nilai Tugas (30%) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    value={formData.tugas}
                                    onChange={(e) => setFormData({ ...formData, tugas: e.target.value })}
                                    className="w-full px-4 py-3 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="0-100"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Nilai UTS (30%) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    value={formData.uts}
                                    onChange={(e) => setFormData({ ...formData, uts: e.target.value })}
                                    className="w-full px-4 py-3 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="0-100"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Nilai UAS (40%) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    value={formData.uas}
                                    onChange={(e) => setFormData({ ...formData, uas: e.target.value })}
                                    className="w-full px-4 py-3 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="0-100"
                                    required
                                />
                            </div>

                            <div className="md:col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 p-4 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Nilai Akhir</p>
                                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                            {nilaiAkhir.toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Grade</p>
                                        <span className={`inline-block px-4 py-2 text-2xl font-bold rounded-lg ${
                                            grade === 'A' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                            grade === 'B' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                            grade === 'C' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                            grade === 'D' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                        }`}>
                                            {grade}
                                        </span>
                                    </div>
                                </div>
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
