import { useForm } from 'react-hook-form';
import { useEffect } from 'react';

interface DosenFormData {
    nidn: string;
    nama: string;
    email: string;
    no_telepon?: string;
    pendidikan_terakhir?: string;
    prodi_id?: string;
    password: string;
}

export default function DosenFormModal({ show, onClose, onSubmit, formData, prodis, isEdit = false }: any) {
    const { register, handleSubmit, formState: { errors }, reset } = useForm<DosenFormData>({
        defaultValues: formData
    });

    useEffect(() => {
        if (show) {
            reset(formData);
        }
    }, [show, formData, reset]);

    if (!show) return null;

    const handleFormSubmit = (data: DosenFormData) => {
        const e = { preventDefault: () => {} } as React.FormEvent;
        Object.assign(formData, data);
        onSubmit(e);
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-start justify-center p-4">
            <div className="relative top-4 md:top-10 mx-auto p-4 md:p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white dark:bg-gray-800">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
                    {isEdit ? 'Edit Data Dosen' : 'Tambah Data Dosen'}
                </h3>
                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">NIDN *</label>
                            <input
                                type="text"
                                {...register('nidn', { required: 'NIDN wajib diisi' })}
                                className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                            />
                            {errors.nidn && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.nidn.message}</p>}
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
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">No. Telepon</label>
                            <input
                                type="text"
                                {...register('no_telepon')}
                                className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                                placeholder="08xxxxxxxxxx"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pendidikan Terakhir</label>
                            <select
                                {...register('pendidikan_terakhir')}
                                className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                            >
                                <option value="">Pilih Pendidikan</option>
                                <option value="S1">S1</option>
                                <option value="S2">S2</option>
                                <option value="S3">S3</option>
                                <option value="Profesor">Profesor</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Program Studi Mengajar</label>
                            <select
                                {...register('prodi_id')}
                                className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                            >
                                <option value="">Pilih Prodi</option>
                                {prodis?.map((prodi: any) => (
                                    <option key={prodi.id} value={prodi.id}>
                                        {prodi.nama_prodi} - {prodi.fakultas?.nama_fakultas}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-2">
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
                    </div>
                    <div className="flex gap-2 mt-6">
                        <button
                            type="submit"
                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        >
                            {isEdit ? 'Update' : 'Simpan'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                        >
                            Batal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
