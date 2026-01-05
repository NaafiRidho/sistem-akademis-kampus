import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import LoadingButton from '@/Components/LoadingButton';

interface JadwalFormData {
    kelas_id: string;
    mata_kuliah_id: string;
    dosen_id: string;
    hari: string;
    jam_mulai: string;
    jam_selesai: string;
    ruangan: string;
}

interface JadwalFormModalProps {
    show: boolean;
    onClose: () => void;
    onSubmit: (data: JadwalFormData) => void;
    formData?: JadwalFormData;
    kelas: Array<{ 
        id: number; 
        nama_kelas: string;
        prodi_id: number;
        prodi: { 
            id: number;
            nama_prodi: string;
        };
    }>;
    mataKuliah: Array<{
        id: number;
        kode_mk: string;
        nama_mk: string;
        prodi_id: number;
        prodi: { 
            id: number;
            nama_prodi: string;
        };
    }>;
    dosen: Array<{
        id: number;
        nidn: string;
        nama: string;
        prodi_id?: number;
        prodi?: { 
            id: number;
            nama_prodi: string;
        };
    }>;
    isEdit: boolean;
    isLoading?: boolean;
}

export default function JadwalFormModal({
    show,
    onClose,
    onSubmit,
    formData,
    kelas,
    mataKuliah,
    dosen,
    isEdit,
    isLoading = false
}: JadwalFormModalProps) {
    const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<JadwalFormData>({
        defaultValues: formData || {
            kelas_id: '',
            mata_kuliah_id: '',
            dosen_id: '',
            hari: '',
            jam_mulai: '',
            jam_selesai: '',
            ruangan: ''
        }
    });

    const hariOptions = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    // Watch kelas_id untuk filtering
    const kelasId = watch('kelas_id');

    // Get selected kelas to determine prodi_id
    const selectedKelas = kelas.find(k => k.id === parseInt(kelasId));
    const selectedProdiId = selectedKelas?.prodi_id;

    // Filter mata kuliah berdasarkan prodi dari kelas yang dipilih
    const filteredMataKuliah = selectedProdiId 
        ? mataKuliah.filter(mk => mk.prodi_id === selectedProdiId)
        : [];

    // Filter dosen berdasarkan prodi dari kelas yang dipilih
    const filteredDosen = selectedProdiId
        ? dosen.filter(d => d.prodi_id === selectedProdiId || !d.prodi_id)
        : [];

    // Reset form ketika modal dibuka/tutup
    useEffect(() => {
        if (show && formData) {
            reset(formData);
        } else if (show && !formData) {
            reset({
                kelas_id: '',
                mata_kuliah_id: '',
                dosen_id: '',
                hari: '',
                jam_mulai: '',
                jam_selesai: '',
                ruangan: ''
            });
        }
    }, [show, formData, reset]);

    // Reset mata_kuliah_id dan dosen_id ketika kelas berubah
    useEffect(() => {
        if (kelasId && selectedKelas) {
            // Cek apakah mata kuliah yang dipilih masih valid untuk prodi baru
            const currentMataKuliahId = watch('mata_kuliah_id');
            const currentDosenId = watch('dosen_id');
            
            const isMataKuliahValid = filteredMataKuliah.some(mk => mk.id.toString() === currentMataKuliahId);
            const isDosenValid = filteredDosen.some(d => d.id.toString() === currentDosenId);
            
            if (!isMataKuliahValid && currentMataKuliahId) {
                setValue('mata_kuliah_id', '');
            }
            if (!isDosenValid && currentDosenId) {
                setValue('dosen_id', '');
            }
        }
    }, [kelasId, selectedKelas, filteredMataKuliah, filteredDosen]);

    const handleFormSubmit = (data: JadwalFormData) => {
        onSubmit(data);
    };

    if (!show) return null;

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
                <form onSubmit={handleSubmit(handleFormSubmit)}>
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
                                    {...register('kelas_id', { required: 'Kelas wajib dipilih' })}
                                    className="w-full px-4 py-3 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="">Pilih Kelas</option>
                                    {kelas.map((k) => (
                                        <option key={k.id} value={k.id}>
                                            {k.nama_kelas} - {k.prodi.nama_prodi}
                                        </option>
                                    ))}
                                </select>
                                {errors.kelas_id && (
                                    <p className="mt-1 text-xs text-red-500">{errors.kelas_id.message}</p>
                                )}
                                {!kelasId && (
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        Pilih kelas terlebih dahulu untuk menampilkan mata kuliah dan dosen
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Mata Kuliah <span className="text-red-500">*</span>
                                </label>
                                <select
                                    {...register('mata_kuliah_id', { required: 'Mata kuliah wajib dipilih' })}
                                    className="w-full px-4 py-3 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!kelasId}
                                >
                                    <option value="">
                                        {!kelasId 
                                            ? 'Pilih kelas terlebih dahulu' 
                                            : filteredMataKuliah.length === 0
                                            ? 'Tidak ada mata kuliah untuk prodi ini'
                                            : 'Pilih Mata Kuliah'
                                        }
                                    </option>
                                    {filteredMataKuliah.map((mk) => (
                                        <option key={mk.id} value={mk.id}>
                                            {mk.kode_mk} - {mk.nama_mk}
                                        </option>
                                    ))}
                                </select>
                                {errors.mata_kuliah_id && (
                                    <p className="mt-1 text-xs text-red-500">{errors.mata_kuliah_id.message}</p>
                                )}
                                {kelasId && filteredMataKuliah.length > 0 && (
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        {filteredMataKuliah.length} mata kuliah tersedia untuk {selectedKelas?.prodi.nama_prodi}
                                    </p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Dosen Pengampu <span className="text-red-500">*</span>
                                </label>
                                <select
                                    {...register('dosen_id', { required: 'Dosen pengampu wajib dipilih' })}
                                    className="w-full px-4 py-3 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!kelasId}
                                >
                                    <option value="">
                                        {!kelasId 
                                            ? 'Pilih kelas terlebih dahulu' 
                                            : filteredDosen.length === 0
                                            ? 'Tidak ada dosen untuk prodi ini'
                                            : 'Pilih Dosen'
                                        }
                                    </option>
                                    {filteredDosen.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.nama} ({d.nidn}){d.prodi ? ` - ${d.prodi.nama_prodi}` : ''}
                                        </option>
                                    ))}
                                </select>
                                {errors.dosen_id && (
                                    <p className="mt-1 text-xs text-red-500">{errors.dosen_id.message}</p>
                                )}
                                {kelasId && filteredDosen.length > 0 && (
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        {filteredDosen.length} dosen tersedia untuk {selectedKelas?.prodi.nama_prodi}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Hari <span className="text-red-500">*</span>
                                </label>
                                <select
                                    {...register('hari', { required: 'Hari wajib dipilih' })}
                                    className="w-full px-4 py-3 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="">Pilih Hari</option>
                                    {hariOptions.map((hari) => (
                                        <option key={hari} value={hari}>{hari}</option>
                                    ))}
                                </select>
                                {errors.hari && (
                                    <p className="mt-1 text-xs text-red-500">{errors.hari.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Ruangan <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    {...register('ruangan', { required: 'Ruangan wajib diisi' })}
                                    className="w-full px-4 py-3 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Contoh: R.101"
                                />
                                {errors.ruangan && (
                                    <p className="mt-1 text-xs text-red-500">{errors.ruangan.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Jam Mulai <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="time"
                                    {...register('jam_mulai', { required: 'Jam mulai wajib diisi' })}
                                    className="w-full px-4 py-3 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                                {errors.jam_mulai && (
                                    <p className="mt-1 text-xs text-red-500">{errors.jam_mulai.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Jam Selesai <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="time"
                                    {...register('jam_selesai', { required: 'Jam selesai wajib diisi' })}
                                    className="w-full px-4 py-3 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                                {errors.jam_selesai && (
                                    <p className="mt-1 text-xs text-red-500">{errors.jam_selesai.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 sm:flex sm:flex-row-reverse gap-3">
                        <LoadingButton
                            type="submit"
                            loading={isLoading}
                            className="w-full sm:w-auto px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200"
                        >
                            {isEdit ? 'Update' : 'Simpan'}
                        </LoadingButton>
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
