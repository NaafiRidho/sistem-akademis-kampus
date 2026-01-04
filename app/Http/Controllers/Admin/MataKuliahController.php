<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MataKuliah;
use App\Models\Prodi;
use Illuminate\Http\Request;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class MataKuliahController extends Controller
{
    public function index(Request $request)
    {
        $query = MataKuliah::with(['prodi.fakultas']);

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nama_mk', 'like', "%{$search}%")
                  ->orWhere('kode_mk', 'like', "%{$search}%")
                  ->orWhereHas('prodi', function($q) use ($search) {
                      $q->where('nama_prodi', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by prodi
        if ($request->has('prodi_id') && $request->prodi_id) {
            $query->where('prodi_id', $request->prodi_id);
        }

        $mataKuliah = $query->orderBy('kode_mk')->paginate(15);
        $prodi = Prodi::with('fakultas')->get();

        return Inertia::render('Admin/MataKuliah/Index', [
            'mataKuliah' => $mataKuliah,
            'prodi' => $prodi,
            'filters' => $request->only(['search', 'prodi_id'])
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kode_mk' => 'required|string|max:20|unique:mata_kuliah,kode_mk',
            'nama_mk' => 'required|string|max:255',
            'sks' => 'required|integer|min:1|max:6',
            'prodi_id' => 'required|exists:prodi,id'
        ]);

        MataKuliah::create($validated);

        return redirect()->route('admin.matakuliah.index')->with('success', 'Mata kuliah berhasil ditambahkan!');
    }

    public function update(Request $request, $id)
    {
        $mataKuliah = MataKuliah::findOrFail($id);
        
        $validated = $request->validate([
            'kode_mk' => 'required|string|max:20|unique:mata_kuliah,kode_mk,' . $mataKuliah->id,
            'nama_mk' => 'required|string|max:255',
            'sks' => 'required|integer|min:1|max:6',
            'prodi_id' => 'required|exists:prodi,id'
        ]);

        $mataKuliah->update($validated);

        return redirect()->route('admin.matakuliah.index')->with('success', 'Mata kuliah berhasil diperbarui!');
    }

    public function destroy($id)
    {
        try {
            $mataKuliah = MataKuliah::findOrFail($id);
            $mataKuliah->delete();
            
            return redirect()->route('admin.matakuliah.index')->with('success', 'Mata kuliah berhasil dihapus!');
        } catch (\Exception $e) {
            return redirect()->route('admin.matakuliah.index')->with('error', 'Mata kuliah tidak dapat dihapus karena masih digunakan!');
        }
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls|max:2048'
        ]);

        try {
            $file = $request->file('file');
            $spreadsheet = IOFactory::load($file->getPathname());
            $worksheet = $spreadsheet->getActiveSheet();
            $rows = $worksheet->toArray();

            // Skip header row
            array_shift($rows);

            $imported = 0;
            $errors = [];

            foreach ($rows as $index => $row) {
                if (empty($row[0])) continue;

                try {
                    // Find prodi by name
                    $prodi = Prodi::where('nama_prodi', $row[3])->first();
                    
                    if (!$prodi) {
                        $errors[] = "Baris " . ($index + 2) . ": Prodi '{$row[3]}' tidak ditemukan";
                        continue;
                    }

                    MataKuliah::create([
                        'kode_mk' => $row[0],
                        'nama_mk' => $row[1],
                        'sks' => $row[2],
                        'prodi_id' => $prodi->id
                    ]);

                    $imported++;
                } catch (\Exception $e) {
                    $errors[] = "Baris " . ($index + 2) . ": " . $e->getMessage();
                }
            }

            if (!empty($errors)) {
                return back()->with('error', "Berhasil import {$imported} data. Error: " . implode(', ', $errors));
            }

            return back()->with('success', "Berhasil import {$imported} mata kuliah!");
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal import data: ' . $e->getMessage());
        }
    }

    public function downloadTemplate()
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Header
        $sheet->setCellValue('A1', 'Kode MK');
        $sheet->setCellValue('B1', 'Nama Mata Kuliah');
        $sheet->setCellValue('C1', 'SKS');
        $sheet->setCellValue('D1', 'Nama Prodi');

        // Sample data
        $sheet->setCellValue('A2', 'TIF101');
        $sheet->setCellValue('B2', 'Pemrograman Dasar');
        $sheet->setCellValue('C2', '3');
        $sheet->setCellValue('D2', 'Teknik Informatika');

        // Styling
        $sheet->getStyle('A1:D1')->getFont()->setBold(true);
        $sheet->getColumnDimension('A')->setWidth(15);
        $sheet->getColumnDimension('B')->setWidth(40);
        $sheet->getColumnDimension('C')->setWidth(10);
        $sheet->getColumnDimension('D')->setWidth(30);

        $writer = new Xlsx($spreadsheet);
        $filename = 'template_mata_kuliah_' . date('Y-m-d') . '.xlsx';
        $temp_file = tempnam(sys_get_temp_dir(), $filename);
        $writer->save($temp_file);

        return response()->download($temp_file, $filename)->deleteFileAfterSend(true);
    }
}
