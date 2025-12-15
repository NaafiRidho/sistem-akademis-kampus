import { useState, useEffect } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import Sidebar from "@/Components/Layout/Sidebar";
import Header from "@/Components/Layout/Header";
import MahasiswaFormModal from "@/Components/Modals/MahasiswaFormModal";
import DeleteConfirmationModal from "@/Components/Modals/DeleteConfirmationModal";
import ImportModal from "@/Components/Modals/ImportModal";

export default function MahasiswaIndex({ mahasiswa, prodis, filters }) {
    const { flash } = usePage().props;
    
    console.log('All page props:', usePage().props);
    console.log('Flash from props:', flash);

    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("darkMode");
            if (saved !== null) return saved === "true";
            return window.matchMedia("(prefers-color-scheme: dark)").matches;
        }
        return false;
    });
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 1024;
        }
        return true;
    });
    const [search, setSearch] = useState(filters.search || "");
    const [prodiFilter, setProdiFilter] = useState(filters.prodi_id || "");
    const [showImportModal, setShowImportModal] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedMahasiswa, setSelectedMahasiswa] = useState(null);
    const [formData, setFormData] = useState({
        nim: "",
        nama: "",
        prodi_id: "",
        angkatan: "",
        jenis_kelamin: "L",
        alamat: "",
        email: "",
        password: "",
    });

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
        localStorage.setItem("darkMode", darkMode);
    }, [darkMode]);

    useEffect(() => {
        if (flash) {
            console.log('Flash messages:', flash);
        }
    }, [flash]);

    const resetFormData = () => ({
        nim: "",
        nama: "",
        prodi_id: "",
        angkatan: "",
        jenis_kelamin: "L",
        alamat: "",
        email: "",
        password: "",
    });

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            "/admin/mahasiswa",
            { search, prodi_id: prodiFilter },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const handleDelete = (mhs) => {
        setSelectedMahasiswa(mhs);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (selectedMahasiswa) {
            router.post(
                `/admin/mahasiswa/${selectedMahasiswa.id}`,
                {
                    _method: "DELETE",
                },
                {
                    onSuccess: () => {
                        setShowDeleteModal(false);
                        setSelectedMahasiswa(null);
                    },
                }
            );
        }
    };

    const handleCreate = () => {
        setFormData(resetFormData());
        setShowCreateModal(true);
    };

    const handleEdit = (mhs) => {
        setSelectedMahasiswa(mhs);
        setFormData({
            nim: mhs.nim,
            nama: mhs.nama,
            prodi_id: mhs.prodi_id,
            angkatan: mhs.angkatan,
            jenis_kelamin: mhs.jenis_kelamin,
            alamat: mhs.alamat,
            email: mhs.user?.email || mhs.email || "",
            password: "",
        });
        setShowEditModal(true);
    };

    const handleSubmitCreate = (e) => {
        e.preventDefault();
        router.post("/admin/mahasiswa", formData, {
            onSuccess: () => {
                setShowCreateModal(false);
                setFormData(resetFormData());
            },
        });
    };

    const handleSubmitEdit = (e) => {
        e.preventDefault();
        router.post(
            `/admin/mahasiswa/${selectedMahasiswa.id}`,
            {
                ...formData,
                _method: "PUT",
            },
            {
                onSuccess: () => {
                    setShowEditModal(false);
                    setSelectedMahasiswa(null);
                },
            }
        );
    };

    const handleImport = (e) => {
        e.preventDefault();
        
        if (!importFile) {
            alert('Silakan pilih file terlebih dahulu');
            return;
        }
        
        const formData = new FormData();
        formData.append("file", importFile);

        router.post("/admin/mahasiswa/import", formData, {
            onSuccess: (page) => {
                console.log('Import success:', page.props.flash);
                setShowImportModal(false);
                setImportFile(null);
            },
            onError: (errors) => {
                console.log('Import errors:', errors);
            },
        });
    };

    return (
        <div className={darkMode ? "dark" : ""}>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
                <Head title="Data Mahasiswa" />

                <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeMenu="mahasiswa" />

                <div className={`p-4 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
                    <Header
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                        darkMode={darkMode}
                        setDarkMode={setDarkMode}
                        title="Data Mahasiswa"
                        subtitle="Kelola data mahasiswa"
                    />

                    <div className="space-y-6">
                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 justify-end">
                            <button
                                onClick={() => setShowImportModal(true)}
                                className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200"
                            >
                                <svg
                                    className="w-5 h-5 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                    />
                                </svg>
                                Import Excel
                            </button>
                            <button
                                onClick={handleCreate}
                                className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200"
                            >
                                <svg
                                    className="w-5 h-5 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                    />
                                </svg>
                                Tambah Mahasiswa
                            </button>
                        </div>

                        {/* Flash Messages */}
                        {flash?.success && (
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 border-l-4 border-green-500 dark:border-green-400 text-green-700 dark:text-green-200 px-6 py-4 rounded-xl shadow-lg flex items-center animate-fade-in">
                                <svg className="w-6 h-6 mr-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="font-medium">{flash.success}</span>
                            </div>
                        )}
                        {flash?.error && (
                            <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900 dark:to-pink-900 border-l-4 border-red-500 dark:border-red-400 text-red-700 dark:text-red-200 px-6 py-4 rounded-xl shadow-lg flex items-center animate-fade-in">
                                <svg className="w-6 h-6 mr-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span className="font-medium">{flash.error}</span>
                            </div>
                        )}
                        {flash?.import_errors && flash.import_errors.length > 0 && (
                            <div className="bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-500 dark:border-yellow-400 text-yellow-700 dark:text-yellow-200 px-6 py-4 rounded-xl shadow-lg">
                                <div className="flex items-center mb-2">
                                    <svg className="w-6 h-6 mr-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <span className="font-medium">Error Import ({flash.import_errors.length} baris):</span>
                                </div>
                                <ul className="list-disc list-inside space-y-1 ml-9 text-sm max-h-40 overflow-y-auto">
                                    {flash.import_errors.slice(0, 10).map((error, index) => (
                                        <li key={index}>{error}</li>
                                    ))}
                                    {flash.import_errors.length > 10 && (
                                        <li className="font-semibold">... dan {flash.import_errors.length - 10} error lainnya</li>
                                    )}
                                </ul>
                            </div>
                        )}

                        {/* Search and Filter */}
                        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center mb-4">
                                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pencarian & Filter</h3>
                            </div>
                            <form
                                onSubmit={handleSearch}
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4"
                            >
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Cari NIM atau Nama..."
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                        className="w-full px-4 py-3 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <select
                                        value={prodiFilter}
                                        onChange={(e) =>
                                            setProdiFilter(e.target.value)
                                        }
                                        className="w-full px-4 py-3 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="">Semua Prodi</option>
                                        {prodis.map((prodi) => (
                                            <option
                                                key={prodi.id}
                                                value={prodi.id}
                                            >
                                                {prodi.nama_prodi} -{" "}
                                                {prodi.fakultas?.nama_fakultas}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <button
                                        type="submit"
                                        className="w-full inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white px-4 py-3 text-base font-semibold rounded-lg transition-colors"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        Cari
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Table */}
                        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            NIM
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Nama
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Prodi
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Angkatan
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Jenis Kelamin
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {mahasiswa.data.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan="6"
                                                className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                                            >
                                                Tidak ada data mahasiswa
                                            </td>
                                        </tr>
                                    ) : (
                                        mahasiswa.data.map((mhs) => (
                                            <tr
                                                key={mhs.id}
                                                className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                    {mhs.nim}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                    {mhs.nama}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                    {mhs.prodi?.nama_prodi}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                    {mhs.angkatan}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                    {mhs.jenis_kelamin === "L"
                                                        ? "Laki-laki"
                                                        : "Perempuan"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleEdit(mhs)}
                                                            className="inline-flex items-center justify-center p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 transform hover:scale-110 transition-all duration-200 shadow-md hover:shadow-lg"
                                                            title="Edit"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(mhs)}
                                                            className="inline-flex items-center justify-center p-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700 transform hover:scale-110 transition-all duration-200 shadow-md hover:shadow-lg"
                                                            title="Hapus"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                            </div>

                            {/* Pagination */}
                            {mahasiswa.links.length > 3 && (
                                <div className="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6">
                                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                        <div className="text-sm text-gray-700 dark:text-gray-300">
                                            Menampilkan {mahasiswa.from} -{" "}
                                            {mahasiswa.to} dari{" "}
                                            {mahasiswa.total} data
                                        </div>
                                        <div className="flex gap-2">
                                            {mahasiswa.links.map(
                                                (link, index) => {
                                                    const Component = link.url
                                                        ? "a"
                                                        : "span";
                                                    return (
                                                        <Component
                                                            key={index}
                                                            href={
                                                                link.url ||
                                                                undefined
                                                            }
                                                            className={`px-3 py-1 rounded ${
                                                                link.active
                                                                    ? "bg-blue-600 text-white"
                                                                    : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 border dark:border-gray-600"
                                                            } ${
                                                                !link.url &&
                                                                "cursor-not-allowed opacity-50"
                                                            }`}
                                                            dangerouslySetInnerHTML={{
                                                                __html: link.label,
                                                            }}
                                                        />
                                                    );
                                                }
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <ImportModal
                show={showImportModal}
                onClose={() => {
                    setShowImportModal(false);
                    setImportFile(null);
                }}
                onSubmit={handleImport}
                file={importFile}
                setFile={setImportFile}
                templateUrl="/admin/mahasiswa/template/download"
                entityName="Mahasiswa"
            />

            <MahasiswaFormModal
                show={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSubmit={handleSubmitCreate}
                formData={formData}
                setFormData={setFormData}
                prodis={prodis}
                isEdit={false}
            />

            <MahasiswaFormModal
                show={showEditModal}
                onClose={() => setShowEditModal(false)}
                onSubmit={handleSubmitEdit}
                formData={formData}
                setFormData={setFormData}
                prodis={prodis}
                isEdit={true}
            />

            <DeleteConfirmationModal
                show={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setSelectedMahasiswa(null);
                }}
                onConfirm={confirmDelete}
                title="Hapus Data Mahasiswa"
                message={`Apakah Anda yakin ingin menghapus data mahasiswa`}
                itemName={
                    selectedMahasiswa
                        ? `${selectedMahasiswa.nama} (${selectedMahasiswa.nim})`
                        : ""
                }
            />
        </div>
    );
}
