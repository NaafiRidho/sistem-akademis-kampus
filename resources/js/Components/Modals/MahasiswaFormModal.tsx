import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
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
    
    // Debug: Log data yang diterima (hanya di development)
    useEffect(() => {
        if (import.meta.env.DEV && show) {
            console.log('MahasiswaFormModal - Kelas Data:', kelas);
            console.log('MahasiswaFormModal - Kelas Count:', kelas?.length || 0);
            console.log('MahasiswaFormModal - Selected Prodi ID:', prodiId);
        }
    }, [show, kelas, prodiId]);
    
    // Filter kelas berdasarkan prodi yang dipilih
    // Tambahkan fallback untuk kasus kelas undefined atau null
    const filteredKelas = prodiId 
        ? (kelas || []).filter((k: Kelas) => k.prodi_id === parseInt(prodiId))
        : (kelas || []);

    // Reset kelas_id when prodi changes
    useEffect(() => {
        setValue('kelas_id', '');
    }, [prodiId, setValue]);

    if (!show) return null;

    const handleFormSubmit = (data: MahasiswaFormData) => {
        onSubmit(data);
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-start justify-center p-4">
            <div className="relative top-4 md:top-10 mx-auto p-4 md:p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white dark:bg-gray-800">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
                    {isEdit ? 'Edit Data Mahasiswa' : 'Tambah Data Mahasiswa'}
                </h3>
                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">NIM *</label>
                            <input
                                type="text"
                                {...register('nim', { required: 'NIM wajib diisi' })}
                                className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                            />
                            {errors.nim && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.nim.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama *</label>
                            <input
                                type="text"
                                {...register('nama', { required: 'Nama wajib diisi' })}
                                className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                            />
                            {errors.nama && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.nama.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prodi *</label>
                            <select
                                {...register('prodi_id', { required: 'Prodi wajib dipilih' })}
                                className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                            >
                                <option value="">Pilih Prodi</option>
                                {prodis.map((prodi: Prodi) => (
                                    <option key={prodi.id} value={prodi.id}>
                                        {prodi.nama_prodi} - {prodi.fakultas?.nama_fakultas}
                                    </option>
                                ))}
                            </select>
                            {errors.prodi_id && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.prodi_id.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Kelas
                                {prodiId && filteredKelas && filteredKelas.length > 0 && (
                                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                        ({filteredKelas.length} kelas tersedia)
                                    </span>
                                )}
                            </label>
                            <select
                                {...register('kelas_id')}
                                className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
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
                            {prodiId && (!filteredKelas || filteredKelas.length === 0) && (
                                <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
                                    ⚠️ Tidak ada kelas untuk prodi ini
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Angkatan *</label>
                            <input
                                type="number"
                                {...register('angkatan', { 
                                    required: 'Angkatan wajib diisi',
                                    min: { value: 2000, message: 'Angkatan minimal 2000' }
                                })}
                                className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                            />
                            {errors.angkatan && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.angkatan.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jenis Kelamin *</label>
                            <select
                                {...register('jenis_kelamin', { required: 'Jenis kelamin wajib dipilih' })}
                                className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                            >
                                <option value="L">Laki-laki</option>
                                <option value="P">Perempuan</option>
                            </select>
                            {errors.jenis_kelamin && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.jenis_kelamin.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                            <input
                                type="email"
                                {...register('email', { 
                                    required: 'Email wajib diisi',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Format email tidak valid'
                                    }
                                })}
                                className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                            />
                            {errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Password {isEdit && '(kosongkan jika tidak diubah)'}
                                {!isEdit && ' *'}
                            </label>
                            <input
                                type="password"
                                {...register('password', { 
                                    required: !isEdit ? 'Password wajib diisi' : false,
                                    minLength: { value: 6, message: 'Password minimal 6 karakter' }
                                })}
                                className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                            />
                            {errors.password && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>}
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alamat</label>
                            <textarea
                                rows={3}
                                {...register('alamat')}
                                className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 mt-6">
                        <LoadingButton
                            type="submit"
                            loading={loading}
                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isEdit ? 'Update' : 'Simpan'}
                        </LoadingButton>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 disabled:opacity-50"
                        >
                            Batal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
