import { useState, useEffect, FormEvent } from "react";
import { Head, router, Link } from "@inertiajs/react";
import DosenSidebar from "@/Components/Layout/DosenSidebar";
import Header from "@/Components/Layout/Header";

interface MataKuliah {
    id: number;
    nama_mk: string;
    kode_mk: string;
    sks: number;
    kelas: string[];
}

interface Props {
    mataKuliahList: MataKuliah[];
}

export default function Create({ mataKuliahList = [] }: Props) {
    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("darkMode");
            if (saved !== null) return saved === "true";
            return window.matchMedia("(prefers-color-scheme: dark)").matches;
        }
        return false;
    });
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        if (typeof window !== "undefined") {
            return window.innerWidth >= 1024;
        }
        return true;
    });

    const [formData, setFormData] = useState({
        mata_kuliah_id: "",
        judul: "",
        file: null as File | null,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fileName, setFileName] = useState("");

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
        localStorage.setItem("darkMode", String(darkMode));
    }, [darkMode]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validasi ukuran file (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                setErrors({ ...errors, file: "Ukuran file maksimal 10MB" });
                return;
            }

            // Validasi tipe file
            const allowedTypes = [
                "application/pdf",
                "application/vnd.ms-powerpoint",
                "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ];
            if (!allowedTypes.includes(file.type)) {
                setErrors({
                    ...errors,
                    file: "Format file harus PDF, PPT, atau DOC",
                });
                return;
            }

            setFormData({ ...formData, file });
            setFileName(file.name);
            setErrors({ ...errors, file: "" });
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        // Validasi form
        const newErrors: Record<string, string> = {};
        if (!formData.mata_kuliah_id)
            newErrors.mata_kuliah_id = "Mata kuliah harus dipilih";
        if (!formData.judul.trim())
            newErrors.judul = "Judul materi harus diisi";
        if (!formData.file) newErrors.file = "File harus diupload";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setIsSubmitting(false);
            return;
        }

        // Submit form dengan FormData
        const data = new FormData();
        data.append("mata_kuliah_id", formData.mata_kuliah_id);
        data.append("judul", formData.judul);
        if (formData.file) {
            data.append("file", formData.file);
        }

        router.post("/dosen/materi", data, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmitting(false);
            },
            onError: (errors) => {
                setErrors(errors as Record<string, string>);
                setIsSubmitting(false);
            },
        });
    };

    const getFileIcon = () => {
        if (!fileName) return null;
        const ext = fileName.split(".").pop()?.toLowerCase();
        switch (ext) {
            case "pdf":
                return (
                    <svg
                        className="w-8 h-8 text-red-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fillRule="evenodd"
                            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                            clipRule="evenodd"
                        />
                    </svg>
                );
            case "ppt":
            case "pptx":
                return (
                    <svg
                        className="w-8 h-8 text-orange-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fillRule="evenodd"
                            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                            clipRule="evenodd"
                        />
                    </svg>
                );
            case "doc":
            case "docx":
                return (
                    <svg
                        className="w-8 h-8 text-blue-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fillRule="evenodd"
                            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                            clipRule="evenodd"
                        />
                    </svg>
                );
            default:
                return null;
        }
    };

    return (
        <div className={darkMode ? "dark" : ""}>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
                <Head title="Upload Materi" />

                <DosenSidebar
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    activeMenu="materi"
                />

                <div
                    className={`p-4 transition-all duration-300 ${
                        sidebarOpen ? "lg:ml-64" : "lg:ml-0"
                    }`}
                >
                    <Header
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                        darkMode={darkMode}
                        setDarkMode={setDarkMode}
                        title="Upload Materi"
                        subtitle="Upload materi pembelajaran untuk mahasiswa"
                    />

                    <div className="max-w-3xl mx-auto">
                        {/* Back Button */}
                        <div className="mb-4">
                            <Link
                                href="/dosen/materi"
                                className="inline-flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Kembali ke Daftar Materi
                            </Link>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Form Upload Materi
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Upload file PDF, PPT, atau DOC (maksimal
                                    10MB)
                                </p>
                            </div>

                            <form
                                onSubmit={handleSubmit}
                                className="p-6 space-y-6"
                            >
                                {/* Mata Kuliah */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Mata Kuliah{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.mata_kuliah_id}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                mata_kuliah_id: e.target.value,
                                            })
                                        }
                                        className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                            errors.mata_kuliah_id
                                                ? "border-red-500"
                                                : "border-gray-300 dark:border-gray-600"
                                        }`}
                                        disabled={
                                            !mataKuliahList ||
                                            mataKuliahList.length === 0
                                        }
                                    >
                                        <option value="">
                                            {!mataKuliahList ||
                                            mataKuliahList.length === 0
                                                ? "Tidak ada mata kuliah yang diampu"
                                                : "Pilih Mata Kuliah"}
                                        </option>
                                        {mataKuliahList &&
                                            mataKuliahList.map((mk) => (
                                                <option
                                                    key={mk.id}
                                                    value={mk.id}
                                                >
                                                    {mk.kode_mk} - {mk.nama_mk} (
                                                    {mk.sks} SKS){" "}
                                                    {mk.kelas &&
                                                    mk.kelas.length > 0
                                                        ? `- Kelas: ${mk.kelas.join(
                                                              ", "
                                                          )}`
                                                        : ""}
                                                </option>
                                            ))}
                                    </select>
                                    {errors.mata_kuliah_id && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.mata_kuliah_id}
                                        </p>
                                    )}
                                    {(!mataKuliahList ||
                                        mataKuliahList.length === 0) && (
                                        <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">
                                            ⚠️ Anda belum memiliki jadwal
                                            mengajar. Silakan hubungi admin
                                            untuk menambahkan jadwal.
                                        </p>
                                    )}
                                </div>

                                {/* Judul Materi */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Judul Materi{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.judul}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                judul: e.target.value,
                                            })
                                        }
                                        placeholder="Contoh: Pengenalan Algoritma dan Pemrograman"
                                        className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                            errors.judul
                                                ? "border-red-500"
                                                : "border-gray-300 dark:border-gray-600"
                                        }`}
                                    />
                                    {errors.judul && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.judul}
                                        </p>
                                    )}
                                </div>

                                {/* File Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Upload File{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <div
                                        className={`border-2 border-dashed rounded-lg p-6 text-center ${
                                            errors.file
                                                ? "border-red-500"
                                                : "border-gray-300 dark:border-gray-600"
                                        }`}
                                    >
                                        <input
                                            type="file"
                                            id="file-upload"
                                            accept=".pdf,.ppt,.pptx,.doc,.docx"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                        <label
                                            htmlFor="file-upload"
                                            className="cursor-pointer flex flex-col items-center"
                                        >
                                            {fileName ? (
                                                <div className="flex items-center space-x-3">
                                                    {getFileIcon()}
                                                    <div className="text-left">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {fileName}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {formData.file
                                                                ? `${(
                                                                      formData
                                                                          .file
                                                                          .size /
                                                                      1024 /
                                                                      1024
                                                                  ).toFixed(
                                                                      2
                                                                  )} MB`
                                                                : ""}
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <svg
                                                        className="mx-auto h-12 w-12 text-gray-400"
                                                        stroke="currentColor"
                                                        fill="none"
                                                        viewBox="0 0 48 48"
                                                    >
                                                        <path
                                                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                            strokeWidth={2}
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                    </svg>
                                                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                                        <span className="font-medium text-blue-600 dark:text-blue-400">
                                                            Klik untuk upload
                                                        </span>{" "}
                                                        atau drag and drop
                                                    </p>
                                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                        PDF, PPT, PPTX, DOC,
                                                        DOCX (maksimal 10MB)
                                                    </p>
                                                </>
                                            )}
                                        </label>
                                    </div>
                                    {errors.file && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.file}
                                        </p>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            router.get("/dosen/materi")
                                        }
                                        className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2 ${
                                            isSubmitting
                                                ? "opacity-50 cursor-not-allowed"
                                                : ""
                                        }`}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <svg
                                                    className="animate-spin h-5 w-5"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    ></circle>
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    ></path>
                                                </svg>
                                                <span>Mengupload...</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg
                                                    className="w-5 h-5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                                    />
                                                </svg>
                                                <span>Upload Materi</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Info Card */}
                        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg
                                        className="h-5 w-5 text-blue-400"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                                        Tips Upload Materi
                                    </h3>
                                    <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                                        <ul className="list-disc pl-5 space-y-1">
                                            <li>
                                                Gunakan judul yang jelas dan
                                                deskriptif
                                            </li>
                                            <li>
                                                File maksimal 10MB untuk
                                                performa optimal
                                            </li>
                                            <li>
                                                Format yang didukung: PDF, PPT,
                                                PPTX, DOC, DOCX
                                            </li>
                                            <li>
                                                Pastikan file dapat dibuka
                                                dengan baik sebelum diupload
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
