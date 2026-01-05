<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Jadwal;
use App\Models\Kelas;
use App\Models\MataKuliah;
use App\Models\Dosen;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use PhpOffice\PhpSpreadsheet\IOFactory;

class JadwalController extends Controller
{
    public function index(Request $request)
    {
        $query = Jadwal::with(['kelas.prodi', 'mataKuliah.prodi', 'dosen.prodi']);

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('hari', 'like', "%{$search}%")
                  ->orWhere('ruangan', 'like', "%{$search}%")
                  ->orWhereHas('mataKuliah', function($q) use ($search) {
                      $q->where('nama_mk', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by hari
        if ($request->has('hari') && $request->hari) {
            $query->where('hari', $request->hari);
        }

        $jadwal = $query->orderBy('hari_order')->orderBy('jam_mulai')->paginate(15);
        $kelas = Kelas::with(['prodi'])->get();
        $mataKuliah = MataKuliah::with(['prodi'])->get();
        $dosen = Dosen::with(['prodi'])->get();

        return Inertia::render('Admin/Jadwal/Index', [
            'jadwal' => $jadwal,
            'kelas' => $kelas,
            'mataKuliah' => $mataKuliah,
            'dosen' => $dosen,
            'filters' => $request->only(['search', 'hari'])
        ]);
    }

    public function create()
    {
        // Not used - form is in modal
        return redirect()->route('admin.jadwal.index');
    }

    public function show(Jadwal $jadwal)
    {
        // Not used - no detail page needed
        return redirect()->route('admin.jadwal.index');
    }

    public function edit(Jadwal $jadwal)
    {
        // Not used - form is in modal
        return redirect()->route('admin.jadwal.index');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kelas_id' => 'required|exists:kelas,id',
            'mata_kuliah_id' => 'required|exists:mata_kuliah,id',
            'dosen_id' => 'required|exists:dosen,id',
            'hari' => 'required|in:Senin,Selasa,Rabu,Kamis,Jumat,Sabtu',
            'jam_mulai' => 'required',
            'jam_selesai' => 'required',
            'ruangan' => 'required|string|max:50'
        ]);

        // Check for scheduling conflicts
        $conflict = Jadwal::where('hari', $validated['hari'])
            ->where('ruangan', $validated['ruangan'])
            ->where(function($q) use ($validated) {
                $q->whereBetween('jam_mulai', [$validated['jam_mulai'], $validated['jam_selesai']])
                  ->orWhereBetween('jam_selesai', [$validated['jam_mulai'], $validated['jam_selesai']])
                  ->orWhere(function($q2) use ($validated) {
                      $q2->where('jam_mulai', '<=', $validated['jam_mulai'])
                         ->where('jam_selesai', '>=', $validated['jam_selesai']);
                  });
            })
            ->exists();

        if ($conflict) {
            return back()->with('error', 'Jadwal bentrok! Ruangan sudah digunakan pada waktu tersebut.');
        }

        // Set hari order for sorting
        $hariOrder = [
            'Senin' => 1, 'Selasa' => 2, 'Rabu' => 3, 
            'Kamis' => 4, 'Jumat' => 5, 'Sabtu' => 6
        ];
        $validated['hari_order'] = $hariOrder[$validated['hari']];

        Jadwal::create($validated);

        return back()->with('success', 'Jadwal kuliah berhasil ditambahkan!');
    }

    public function update(Request $request, Jadwal $jadwal)
    {
        $validated = $request->validate([
            'kelas_id' => 'required|exists:kelas,id',
            'mata_kuliah_id' => 'required|exists:mata_kuliah,id',
            'dosen_id' => 'required|exists:dosen,id',
            'hari' => 'required|in:Senin,Selasa,Rabu,Kamis,Jumat,Sabtu',
            'jam_mulai' => 'required',
            'jam_selesai' => 'required',
            'ruangan' => 'required|string|max:50'
        ]);

        // Check for scheduling conflicts (excluding current jadwal)
        $conflict = Jadwal::where('id', '!=', $jadwal->id)
            ->where('hari', $validated['hari'])
            ->where('ruangan', $validated['ruangan'])
            ->where(function($q) use ($validated) {
                $q->whereBetween('jam_mulai', [$validated['jam_mulai'], $validated['jam_selesai']])
                  ->orWhereBetween('jam_selesai', [$validated['jam_mulai'], $validated['jam_selesai']])
                  ->orWhere(function($q2) use ($validated) {
                      $q2->where('jam_mulai', '<=', $validated['jam_mulai'])
                         ->where('jam_selesai', '>=', $validated['jam_selesai']);
                  });
            })
            ->exists();

        if ($conflict) {
            return back()->with('error', 'Jadwal bentrok! Ruangan sudah digunakan pada waktu tersebut.');
        }

        $hariOrder = [
            'Senin' => 1, 'Selasa' => 2, 'Rabu' => 3, 
            'Kamis' => 4, 'Jumat' => 5, 'Sabtu' => 6
        ];
        $validated['hari_order'] = $hariOrder[$validated['hari']];

        $jadwal->update($validated);

        return back()->with('success', 'Jadwal kuliah berhasil diperbarui!');
    }

    public function destroy(Jadwal $jadwal)
    {
        $jadwal->delete();
        return back()->with('success', 'Jadwal kuliah berhasil dihapus!');
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv'
        ]);

        try {
            $file = $request->file('file');
            $spreadsheet = IOFactory::load($file->getRealPath());
            $sheet = $spreadsheet->getActiveSheet();
            $rows = $sheet->toArray();

            $imported = 0;
            $errors = [];
            
            DB::beginTransaction();
            
            foreach ($rows as $index => $row) {
                if ($index === 0) continue; // Skip header
                
                // Skip empty rows
                if (empty($row[0]) && empty($row[1])) continue;
                
                try {
                    // Expected columns: Nama Kelas, Kode MK, NIDN, Hari, Jam Mulai, Jam Selesai, Ruangan
                    $kelas = Kelas::where('nama_kelas', $row[0])->first();
                    $mataKuliah = MataKuliah::where('kode_mk', $row[1])->first();
                    $dosen = Dosen::where('nidn', $row[2])->first();
                    
                    if (!$kelas) {
                        $errors[] = "Baris " . ($index + 1) . ": Kelas '{$row[0]}' tidak ditemukan";
                        continue;
                    }
                    
                    if (!$mataKuliah) {
                        $errors[] = "Baris " . ($index + 1) . ": Mata Kuliah '{$row[1]}' tidak ditemukan";
                        continue;
                    }
                    
                    if (!$dosen) {
                        $errors[] = "Baris " . ($index + 1) . ": Dosen dengan NIDN '{$row[2]}' tidak ditemukan";
                        continue;
                    }

                    $hariOrder = [
                        'Senin' => 1, 'Selasa' => 2, 'Rabu' => 3, 
                        'Kamis' => 4, 'Jumat' => 5, 'Sabtu' => 6
                    ];

                    // Check for conflicts
                    $conflict = Jadwal::where('hari', $row[3])
                        ->where('ruangan', $row[6])
                        ->where(function($q) use ($row) {
                            $q->whereBetween('jam_mulai', [$row[4], $row[5]])
                              ->orWhereBetween('jam_selesai', [$row[4], $row[5]])
                              ->orWhere(function($q2) use ($row) {
                                  $q2->where('jam_mulai', '<=', $row[4])
                                     ->where('jam_selesai', '>=', $row[5]);
                              });
                        })
                        ->exists();

                    if ($conflict) {
                        $errors[] = "Baris " . ($index + 1) . ": Jadwal bentrok untuk ruangan {$row[6]} pada hari {$row[3]}";
                        continue;
                    }

                    Jadwal::create([
                        'kelas_id' => $kelas->id,
                        'mata_kuliah_id' => $mataKuliah->id,
                        'dosen_id' => $dosen->id,
                        'hari' => $row[3],
                        'hari_order' => $hariOrder[$row[3]] ?? 0,
                        'jam_mulai' => $row[4],
                        'jam_selesai' => $row[5],
                        'ruangan' => $row[6]
                    ]);
                    
                    $imported++;
                } catch (\Exception $e) {
                    $errors[] = "Baris " . ($index + 1) . ": " . $e->getMessage();
                }
            }
            
            DB::commit();
            
            $message = "Berhasil mengimpor {$imported} jadwal";
            if (!empty($errors)) {
                return back()->with([
                    'success' => $message,
                    'import_errors' => $errors
                ]);
            }
            
            return back()->with('success', $message);
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Import jadwal error: ' . $e->getMessage());
            return back()->with('error', 'Gagal mengimpor data: ' . $e->getMessage());
        }
    }

    public function downloadTemplate()
    {
        $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        
        // Header
        $sheet->setCellValue('A1', 'Nama Kelas');
        $sheet->setCellValue('B1', 'Kode Mata Kuliah');
        $sheet->setCellValue('C1', 'NIDN Dosen');
        $sheet->setCellValue('D1', 'Hari');
        $sheet->setCellValue('E1', 'Jam Mulai');
        $sheet->setCellValue('F1', 'Jam Selesai');
        $sheet->setCellValue('G1', 'Ruangan');
        
        // Make header bold
        $sheet->getStyle('A1:G1')->getFont()->setBold(true);
        
        // Example data
        $sheet->setCellValue('A2', 'TS-1A');
        $sheet->setCellValue('B2', 'TS101');
        $sheet->setCellValue('C2', '0000000001');
        $sheet->setCellValue('D2', 'Senin');
        $sheet->setCellValue('E2', '08:00');
        $sheet->setCellValue('F2', '10:00');
        $sheet->setCellValue('G2', 'R.101');
        
        // Auto-size columns
        foreach(range('A','G') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }
        
        $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
        $filename = 'template_jadwal_' . date('YmdHis') . '.xlsx';
        $temp_file = tempnam(sys_get_temp_dir(), $filename);
        $writer->save($temp_file);
        
        return response()->download($temp_file, $filename)->deleteFileAfterSend(true);
    }
}
