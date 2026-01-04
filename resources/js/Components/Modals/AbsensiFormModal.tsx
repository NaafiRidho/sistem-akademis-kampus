import React from 'react';
import { createPortal } from 'react-dom';

interface AbsensiFormModalProps {
    show: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    formData: {
        mahasiswa_id: string;
        jadwal_id: string;
        tanggal: string;
        status: string;
        keterangan: string;
    };
    setFormData: (data: any) => void;
    mahasiswa: Array<{ id: number; nim: string; nama: string }>;
    jadwal: Array<{ 
        id: number;
        hari: string;
        jam_mulai: string;
        jam_selesai: string;
        kelas: {
            kode_kelas: string;
            mata_kuliah: { nama_mk: string };
        };
    }>;
    isEdit: boolean;
}

export default function AbsensiFormModal({
    show,
    onClose,
    onSubmit,
    formData,
    setFormData,
    mahasiswa,
    jadwal,
    isEdit
}: AbsensiFormModalProps) {
    if (!show) return null;

    const statusOptions = [
        { value: 'Hadir', label: 'Hadir', color: 'text-green-600' },
        { value: 'Izin', label: 'Izin', color: 'text-blue-600' },
        { value: 'Sakit', label: 'Sakit', color: 'text-yellow-600' },
        { value: 'Alpa', label: 'Alpa', color: 'text-red-600' }
    ];

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
                                {isEdit ? 'Edit Absensi' : 'Tambah Absensi'}
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
                                    Jadwal Kuliah <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.jadwal_id}
                                    onChange={(e) => setFormData({ ...formData, jadwal_id: e.target.value })}
                                    className="w-full px-4 py-3 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                    disabled={isEdit}
                                >
                                    <option value="">Pilih Jadwal</option>
                                    {jadwal.map((j) => (
                                        <option key={j.id} value={j.id}>
                                            {j.kelas.mata_kuliah.nama_mk} - {j.hari} ({j.jam_mulai} - {j.jam_selesai})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Tanggal <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={formData.tanggal}
                                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                                    className="w-full px-4 py-3 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Status <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-4 py-3 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Pilih Status</option>
                                    {statusOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value} className={opt.color}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Keterangan
                                </label>
                                <textarea
                                    value={formData.keterangan}
                                    onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-3 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Keterangan tambahan (opsional)"
                                />
                            </div>

                            {formData.status && (
                                <div className="md:col-span-2 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 p-4 rounded-lg">
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-sm text-gray-600 dark:text-gray-300">
                                            Status terpilih: <span className={`font-bold ${
                                                formData.status === 'Hadir' ? 'text-green-600' :
                                                formData.status === 'Izin' ? 'text-blue-600' :
                                                formData.status === 'Sakit' ? 'text-yellow-600' :
                                                'text-red-600'
                                            }`}>{formData.status}</span>
                                        </span>
                                    </div>
                                </div>
                            )}
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
