<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Prodi;
use App\Models\Fakultas;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use PhpOffice\PhpSpreadsheet\IOFactory;

class ProdiController extends Controller
{
    public function index(Request $request)
    {
        $query = Prodi::with('fakultas')->withCount('mahasiswa');

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nama_prodi', 'like', "%{$search}%")
                  ->orWhereHas('fakultas', function($q) use ($search) {
                      $q->where('nama_fakultas', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by fakultas
        if ($request->has('fakultas_id') && $request->fakultas_id) {
            $query->where('fakultas_id', $request->fakultas_id);
        }

        $prodi = $query->orderBy('created_at', 'desc')->paginate(15);
        $fakultas = Fakultas::all();

        return Inertia::render('Admin/Prodi/Index', [
            'prodi' => $prodi,
            'fakultas' => $fakultas,
            'filters' => $request->only(['search', 'fakultas_id'])
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'fakultas_id' => 'required|exists:fakultas,id',
            'nama_prodi' => 'required|string|max:255'
        ]);

        try {
            // Check if prodi already exists in the same fakultas
            $exists = Prodi::where('fakultas_id', $validated['fakultas_id'])
                          ->where('nama_prodi', $validated['nama_prodi'])
                          ->exists();
            
            if ($exists) {
                return back()->with('error', 'Program Studi sudah ada di fakultas ini');
            }

            Prodi::create($validated);

            return redirect()->route('admin.prodi.index')
                ->with('success', 'Data program studi berhasil ditambahkan');
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal menambahkan data: ' . $e->getMessage());
        }
    }

    public function update(Request $request, $id)
    {
        $prodi = Prodi::findOrFail($id);

        $validated = $request->validate([
            'fakultas_id' => 'required|exists:fakultas,id',
            'nama_prodi' => 'required|string|max:255'
        ]);

        try {
            // Check if prodi already exists in the same fakultas (excluding current)
            $exists = Prodi::where('fakultas_id', $validated['fakultas_id'])
                          ->where('nama_prodi', $validated['nama_prodi'])
                          ->where('id', '!=', $id)
                          ->exists();
            
            if ($exists) {
                return back()->with('error', 'Program Studi sudah ada di fakultas ini');
            }

            $prodi->update($validated);

            return redirect()->route('admin.prodi.index')
                ->with('success', 'Data program studi berhasil diupdate');
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal mengupdate data: ' . $e->getMessage());
        }
    }

    public function destroy($id)
    {
        try {
            $prodi = Prodi::findOrFail($id);
            
            // Check if prodi has mahasiswa
            if ($prodi->mahasiswa()->count() > 0) {
                return back()->with('error', 'Tidak dapat menghapus program studi yang masih memiliki mahasiswa');
            }

            $prodi->delete();

            return redirect()->route('admin.prodi.index')
                ->with('success', 'Data program studi berhasil dihapus');
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal menghapus data: ' . $e->getMessage());
        }
    }

    public function import(Request $request)
    {
        Log::info('=== PRODI IMPORT START ===');
        
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
                    if (empty($row[0]) || empty($row[1])) {
                        $errors[] = "Baris " . ($index + 2) . ": Data tidak lengkap (Nama Prodi atau Fakultas ID kosong)";
                        continue;
                    }

                    // Validate fakultas exists
                    if (!Fakultas::find($row[1])) {
                        $errors[] = "Baris " . ($index + 2) . ": Fakultas ID {$row[1]} tidak ditemukan";
                        continue;
                    }

                    // Check if prodi already exists in the same fakultas
                    $exists = Prodi::where('fakultas_id', $row[1])
                                  ->where('nama_prodi', $row[0])
                                  ->exists();
                    
                    if ($exists) {
                        $errors[] = "Baris " . ($index + 2) . ": Program Studi '{$row[0]}' sudah ada di fakultas ini";
                        continue;
                    }

                    // Create prodi
                    Prodi::create([
                        'nama_prodi' => $row[0],
                        'fakultas_id' => $row[1]
                    ]);

                    $imported++;
                } catch (\Exception $e) {
                    $errors[] = "Baris " . ($index + 2) . ": " . $e->getMessage();
                    Log::error('Prodi import row error', ['row' => $index + 2, 'error' => $e->getMessage()]);
                }
            }

            DB::commit();

            Log::info("Import completed. Imported: {$imported}, Errors: " . count($errors));

            if ($imported === 0 && !empty($errors)) {
                return redirect()->route('admin.prodi.index')
                    ->with('error', 'Gagal mengimport data. ' . implode(', ', array_slice($errors, 0, 3)));
            }

            $message = "Berhasil mengimport {$imported} data program studi";
            if (!empty($errors)) {
                $message .= ". Terdapat " . count($errors) . " error";
            }

            return redirect()->route('admin.prodi.index')
                ->with([
                    'success' => $message,
                    'import_errors' => $errors
                ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->route('admin.prodi.index')
                ->with('error', 'Gagal mengimport data: ' . $e->getMessage());
        }
    }

    public function downloadTemplate()
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="template_prodi.csv"',
        ];

        $columns = ['Nama Program Studi', 'Fakultas ID'];

        $callback = function() use ($columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);
            fputcsv($file, ['Teknik Informatika', '1']);
            fputcsv($file, ['Sistem Informasi', '1']);
            fputcsv($file, ['Manajemen', '2']);
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
