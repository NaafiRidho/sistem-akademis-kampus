import React from 'react';
import { createPortal } from 'react-dom';

interface JadwalFormModalProps {
    show: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    formData: {
        kelas_id: string;
        mata_kuliah_id: string;
        dosen_id: string;
        hari: string;
        jam_mulai: string;
        jam_selesai: string;
        ruangan: string;
    };
    setFormData: (data: any) => void;
    kelas: Array<{ 
        id: number; 
        nama_kelas: string;
        prodi: { nama_prodi: string };
    }>;
    mataKuliah: Array<{
        id: number;
        kode_mk: string;
        nama_mk: string;
        prodi: { nama_prodi: string };
    }>;
    dosen: Array<{
        id: number;
        nip: string;
        nama: string;
    }>;
    isEdit: boolean;
}

export default function JadwalFormModal({
    show,
    onClose,
    onSubmit,
    formData,
    setFormData,
    kelas,
    mataKuliah,
    dosen,
    isEdit
}: JadwalFormModalProps) {
    if (!show) return null;

    const hariOptions = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

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
                                {isEdit ? 'Edit Jadwal Kuliah' : 'Tambah Jadwal Kuliah'}
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
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Kelas <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.kelas_id}
                                    onChange={(e) => setFormData({ ...formData, kelas_id: e.target.value })}
                                    className="w-full px-4 py-3 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Pilih Kelas</option>
                                    {kelas.map((k) => (
                                        <option key={k.id} value={k.id}>
                                            {k.nama_kelas} - {k.prodi.nama_prodi}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Mata Kuliah <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.mata_kuliah_id}
                                    onChange={(e) => setFormData({ ...formData, mata_kuliah_id: e.target.value })}
                                    className="w-full px-4 py-3 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Pilih Mata Kuliah</option>
                                    {mataKuliah.map((mk) => (
                                        <option key={mk.id} value={mk.id}>
                                            {mk.kode_mk} - {mk.nama_mk}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Dosen Pengampu <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.dosen_id}
                                    onChange={(e) => setFormData({ ...formData, dosen_id: e.target.value })}
                                    className="w-full px-4 py-3 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Pilih Dosen</option>
                                    {dosen.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.nama} ({d.nip})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Hari <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.hari}
                                    onChange={(e) => setFormData({ ...formData, hari: e.target.value })}
                                    className="w-full px-4 py-3 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Pilih Hari</option>
                                    {hariOptions.map((hari) => (
                                        <option key={hari} value={hari}>{hari}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Ruangan <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.ruangan}
                                    onChange={(e) => setFormData({ ...formData, ruangan: e.target.value })}
                                    className="w-full px-4 py-3 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Contoh: R.101"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Jam Mulai <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="time"
                                    value={formData.jam_mulai}
                                    onChange={(e) => setFormData({ ...formData, jam_mulai: e.target.value })}
                                    className="w-full px-4 py-3 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Jam Selesai <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="time"
                                    value={formData.jam_selesai}
                                    onChange={(e) => setFormData({ ...formData, jam_selesai: e.target.value })}
                                    className="w-full px-4 py-3 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
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
