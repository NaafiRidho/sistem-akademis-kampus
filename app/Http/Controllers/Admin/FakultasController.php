<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Fakultas;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use PhpOffice\PhpSpreadsheet\IOFactory;

class FakultasController extends Controller
{
    public function index(Request $request)
    {
        $query = Fakultas::withCount('prodi');

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('nama_fakultas', 'like', "%{$search}%");
        }

        $fakultas = $query->orderBy('created_at', 'desc')->paginate(15);

        return Inertia::render('Admin/Fakultas/Index', [
            'fakultas' => $fakultas,
            'filters' => $request->only(['search'])
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_fakultas' => 'required|string|max:255|unique:fakultas,nama_fakultas'
        ]);

        try {
            Fakultas::create($validated);

            return redirect()->route('admin.fakultas.index')
                ->with('success', 'Data fakultas berhasil ditambahkan');
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal menambahkan data: ' . $e->getMessage());
        }
    }

    public function update(Request $request, $id)
    {
        $fakultas = Fakultas::findOrFail($id);

        $validated = $request->validate([
            'nama_fakultas' => 'required|string|max:255|unique:fakultas,nama_fakultas,' . $id
        ]);

        try {
            $fakultas->update($validated);

            return redirect()->route('admin.fakultas.index')
                ->with('success', 'Data fakultas berhasil diupdate');
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal mengupdate data: ' . $e->getMessage());
        }
    }

    public function destroy($id)
    {
        try {
            $fakultas = Fakultas::findOrFail($id);
            
            // Check if fakultas has prodi
            if ($fakultas->prodi()->count() > 0) {
                return back()->with('error', 'Tidak dapat menghapus fakultas yang masih memiliki program studi');
            }

            $fakultas->delete();

            return redirect()->route('admin.fakultas.index')
                ->with('success', 'Data fakultas berhasil dihapus');
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal menghapus data: ' . $e->getMessage());
        }
    }

    public function import(Request $request)
    {
        Log::info('=== FAKULTAS IMPORT START ===');
        
        try {
            $request->validate([
                'file' => 'required|file|max:10240'
            ]);
            
            // Manual validation for file extension
            $file = $request->file('file');
            $extension = strtolower($file->getClientOriginalExtension());
            
            if (!in_array($extension, ['xlsx', 'xls', 'csv'])) {
                return back()->with('error', 'File harus berformat Excel (.xlsx, .xls) atau CSV (.csv). File Anda: .' . $extension);
            }
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->with('error', 'Validasi gagal: ' . implode(', ', $e->validator->errors()->all()));
        }

        try {
            $file = $request->file('file');
            Log::info('Import file received: ' . $file->getClientOriginalName());
            
            $spreadsheet = IOFactory::load($file->getRealPath());
            $sheet = $spreadsheet->getActiveSheet();
            $rows = $sheet->toArray();

            Log::info('Total rows in file: ' . count($rows));

            // Skip header row
            array_shift($rows);

            $imported = 0;
            $errors = [];

            if (empty($rows)) {
                return back()->with('error', 'File tidak berisi data');
            }

            DB::beginTransaction();

            foreach ($rows as $index => $row) {
                try {
                    // Skip completely empty rows
                    if (empty(array_filter($row))) {
                        continue;
                    }

                    // Validate required fields
                    if (empty($row[0])) {
                        $errors[] = "Baris " . ($index + 2) . ": Nama fakultas tidak boleh kosong";
                        continue;
                    }

                    // Check if nama_fakultas already exists
                    if (Fakultas::where('nama_fakultas', $row[0])->exists()) {
                        $errors[] = "Baris " . ($index + 2) . ": Fakultas '{$row[0]}' sudah ada";
                        continue;
                    }

                    // Create fakultas
                    Fakultas::create([
                        'nama_fakultas' => $row[0]
                    ]);

                    $imported++;
                } catch (\Exception $e) {
                    $errors[] = "Baris " . ($index + 2) . ": " . $e->getMessage();
                    Log::error('Fakultas import row error', ['row' => $index + 2, 'error' => $e->getMessage()]);
                }
            }

            DB::commit();

            Log::info("Import completed. Imported: {$imported}, Errors: " . count($errors));

            if ($imported === 0 && !empty($errors)) {
                return redirect()->route('admin.fakultas.index')
                    ->with('error', 'Gagal mengimport data. ' . implode(', ', array_slice($errors, 0, 3)));
            }

            $message = "Berhasil mengimport {$imported} data fakultas";
            if (!empty($errors)) {
                $message .= ". Terdapat " . count($errors) . " error";
            }

            return redirect()->route('admin.fakultas.index')
                ->with([
                    'success' => $message,
                    'import_errors' => $errors
                ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->route('admin.fakultas.index')
                ->with('error', 'Gagal mengimport data: ' . $e->getMessage());
        }
    }

    public function downloadTemplate()
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="template_fakultas.csv"',
        ];

        $columns = ['Nama Fakultas'];

        $callback = function() use ($columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);
            fputcsv($file, ['Fakultas Teknik']);
            fputcsv($file, ['Fakultas Ekonomi dan Bisnis']);
            fputcsv($file, ['Fakultas Ilmu Komputer']);
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
