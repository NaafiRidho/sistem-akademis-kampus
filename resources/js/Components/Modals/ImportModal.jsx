export default function ImportModal({ show, onClose, onSubmit, file, setFile, templateUrl, entityName }) {
    if (!show) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!file) {
            alert('Pilih file terlebih dahulu');
            return;
        }
        onSubmit(e);
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-start justify-center p-4">
            <div className="relative top-10 md:top-20 mx-auto p-4 md:p-5 border w-full max-w-md shadow-lg rounded-md bg-white dark:bg-gray-800">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
                    Import Data {entityName}
                </h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Pilih File Excel
                        </label>
                        <input
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={(e) => setFile(e.target.files[0])}
                            className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                        />
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            Format: .xlsx, .xls, atau .csv
                        </p>
                    </div>
                    <div className="mb-4">
                        <a
                            href={templateUrl}
                            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                            Download Template Excel
                        </a>
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        >
                            Import
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
