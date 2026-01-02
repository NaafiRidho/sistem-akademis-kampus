export default function DosenFormModal({ show, onClose, onSubmit, formData, setFormData, prodis, isEdit = false }) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-start justify-center p-4">
            <div className="relative top-4 md:top-10 mx-auto p-4 md:p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white dark:bg-gray-800">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
                    {isEdit ? 'Edit Data Dosen' : 'Tambah Data Dosen'}
                </h3>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">NIDN *</label>
                            <input
                                type="text"
                                required
                                value={formData.nidn}
                                onChange={(e) => setFormData({ ...formData, nidn: e.target.value })}
                                className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama *</label>
                            <input
                                type="text"
                                required
                                value={formData.nama}
                                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">No. Telepon</label>
                            <input
                                type="text"
                                value={formData.no_telepon || ''}
                                onChange={(e) => setFormData({ ...formData, no_telepon: e.target.value })}
                                className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                                placeholder="08xxxxxxxxxx"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pendidikan Terakhir</label>
                            <select
                                value={formData.pendidikan_terakhir || ''}
                                onChange={(e) => setFormData({ ...formData, pendidikan_terakhir: e.target.value })}
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
                                value={formData.prodi_id || ''}
                                onChange={(e) => setFormData({ ...formData, prodi_id: e.target.value })}
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
                                required={!isEdit}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                            />
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
