<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Nilai;
use App\Models\Mahasiswa;
use App\Models\MataKuliah;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\IOFactory;

class NilaiController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Nilai::with(['mahasiswa.prodi', 'mataKuliah']);

            // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->whereHas('mahasiswa', function($q) use ($search) {
                    $q->where('nama', 'like', "%{$search}%")
                      ->orWhere('nim', 'like', "%{$search}%");
                })
                ->orWhereHas('mataKuliah', function($q) use ($search) {
                    $q->where('nama_mk', 'like', "%{$search}%");
                });
            });
        }

        // Filter by prodi
        if ($request->has('prodi_id') && $request->prodi_id) {
            $query->whereHas('mahasiswa', function($q) use ($request) {
                $q->where('prodi_id', $request->prodi_id);
            });
        }

        // Filter by kelas
        if ($request->has('kelas_id') && $request->kelas_id) {
            $query->whereHas('mahasiswa', function($q) use ($request) {
                $q->where('kelas_id', $request->kelas_id);
            });
        }

        // Filter by mahasiswa
        if ($request->has('mahasiswa_id') && $request->mahasiswa_id) {
            $query->where('mahasiswa_id', $request->mahasiswa_id);
        }

        // Filter by mata kuliah
        if ($request->has('mata_kuliah_id') && $request->mata_kuliah_id) {
            $query->where('mata_kuliah_id', $request->mata_kuliah_id);
        }

        $perPage = $request->input('per_page', 15);
        $nilai = $query->orderBy('created_at', 'desc')->paginate($perPage);
        
        // Transform data untuk frontend
        $nilai->getCollection()->transform(function($item) {
            return [
                'id' => $item->id,
                'mahasiswa' => [
                    'id' => $item->mahasiswa->id,
                    'nim' => $item->mahasiswa->nim,
                    'nama' => $item->mahasiswa->nama,
                    'prodi' => [
                        'id' => $item->mahasiswa->prodi->id,
                        'nama_prodi' => $item->mahasiswa->prodi->nama_prodi,
                    ],
                ],
                'mata_kuliah' => [
                    'id' => $item->mataKuliah->id,
                    'nama' => $item->mataKuliah->nama_mk,
                    'kode' => $item->mataKuliah->kode_mk,
                    'sks' => $item->mataKuliah->sks,
                ],
                'semester' => $item->semester,
                'tahun_ajaran' => $item->tahun_ajaran,
                'tugas' => $item->tugas,
                'uts' => $item->uts,
                'uas' => $item->uas,
                'nilai_akhir' => $item->nilai_akhir,
                'grade' => $item->grade,
                'created_at' => $item->created_at,
            ];
        });
        
        // Transform mahasiswa data
        $mahasiswa = Mahasiswa::with('prodi')->get()->map(function($item) {
            return [
                'id' => $item->id,
                'nim' => $item->nim,
                'nama' => $item->nama,
                'prodi' => [
                    'id' => $item->prodi->id,
                    'nama_prodi' => $item->prodi->nama_prodi,
                ],
            ];
        });
        
        // Transform mata kuliah data
        $mataKuliah = MataKuliah::all()->map(function($item) {
            return [
                'id' => $item->id,
                'nama' => $item->nama_mk,
                'kode' => $item->kode_mk,
                'sks' => $item->sks,
            ];
        });

        // Get prodi and kelas for filters
        $prodi = \App\Models\Prodi::all()->map(function($item) {
            return [
                'id' => $item->id,
                'nama_prodi' => $item->nama_prodi,
            ];
        });

        $kelas = \App\Models\Kelas::with('prodi')->get()->map(function($item) {
            return [
                'id' => $item->id,
                'nama_kelas' => $item->nama_kelas,
                'prodi_id' => $item->prodi_id,
                'prodi_nama' => $item->prodi->nama_prodi,
            ];
        });

            return Inertia::render('Admin/Nilai/Index', [
                'nilai' => $nilai,
                'mahasiswa' => $mahasiswa,
                'mataKuliah' => $mataKuliah,
                'prodi' => $prodi,
                'kelas' => $kelas,
                'filters' => $request->only(['search', 'mahasiswa_id', 'mata_kuliah_id', 'prodi_id', 'kelas_id', 'per_page'])
            ]);
        } catch (\Exception $e) {
            return Inertia::render('Admin/Nilai/Index', [
                'nilai' => ['data' => [], 'current_page' => 1, 'last_page' => 1, 'per_page' => 15, 'total' => 0],
                'mahasiswa' => [],
                'mataKuliah' => [],
                'prodi' => [],
                'kelas' => [],
                'filters' => $request->only(['search', 'mahasiswa_id', 'mata_kuliah_id', 'prodi_id', 'kelas_id', 'per_page'])
            ]);
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'mahasiswa_id' => 'required|exists:mahasiswa,id',
            'mata_kuliah_id' => 'required|exists:mata_kuliah,id',
            'semester' => 'required|integer|min:1|max:14',
            'tahun_ajaran' => 'required|string',
            'tugas' => 'nullable|numeric|min:0|max:100',
            'uts' => 'nullable|numeric|min:0|max:100',
            'uas' => 'nullable|numeric|min:0|max:100',
        ]);

        // Check if nilai already exists
        $exists = Nilai::where('mahasiswa_id', $validated['mahasiswa_id'])
            ->where('mata_kuliah_id', $validated['mata_kuliah_id'])
            ->where('semester', $validated['semester'])
            ->where('tahun_ajaran', $validated['tahun_ajaran'])
            ->exists();

        if ($exists) {
            return back()->with('error', 'Nilai untuk mahasiswa dan mata kuliah ini sudah ada pada semester dan tahun ajaran tersebut!');
        }

        // Calculate final grade
        $nilaiTugas = $validated['tugas'] ?? 0;
        $nilaiUts = $validated['uts'] ?? 0;
        $nilaiUas = $validated['uas'] ?? 0;
        
        $nilaiAkhir = ($nilaiTugas * 0.3) + ($nilaiUts * 0.3) + ($nilaiUas * 0.4);
        
        // Determine grade letter
        if ($nilaiAkhir >= 85) $huruf = 'A';
        elseif ($nilaiAkhir >= 70) $huruf = 'B';
        elseif ($nilaiAkhir >= 60) $huruf = 'C';
        elseif ($nilaiAkhir >= 50) $huruf = 'D';
        else $huruf = 'E';

        $validated['nilai_akhir'] = round($nilaiAkhir, 2);
        $validated['grade'] = $huruf;

        Nilai::create($validated);

        return back()->with('success', 'Nilai berhasil ditambahkan!');
    }

    public function update(Request $request, Nilai $nilai)
    {
        $validated = $request->validate([
            'mahasiswa_id' => 'required|exists:mahasiswa,id',
            'mata_kuliah_id' => 'required|exists:mata_kuliah,id',
            'semester' => 'required|integer|min:1|max:14',
            'tahun_ajaran' => 'required|string',
            'tugas' => 'nullable|numeric|min:0|max:100',
            'uts' => 'nullable|numeric|min:0|max:100',
            'uas' => 'nullable|numeric|min:0|max:100',
        ]);

        // Calculate final grade
        $nilaiTugas = $validated['tugas'] ?? 0;
        $nilaiUts = $validated['uts'] ?? 0;
        $nilaiUas = $validated['uas'] ?? 0;
        
        $nilaiAkhir = ($nilaiTugas * 0.3) + ($nilaiUts * 0.3) + ($nilaiUas * 0.4);
        
        if ($nilaiAkhir >= 85) $huruf = 'A';
        elseif ($nilaiAkhir >= 70) $huruf = 'B';
        elseif ($nilaiAkhir >= 60) $huruf = 'C';
        elseif ($nilaiAkhir >= 50) $huruf = 'D';
        else $huruf = 'E';

        $validated['nilai_akhir'] = round($nilaiAkhir, 2);
        $validated['grade'] = $huruf;

        $nilai->update($validated);

        return back()->with('success', 'Nilai berhasil diperbarui!');
    }

    public function destroy(Nilai $nilai)
    {
        $nilai->delete();
        return back()->with('success', 'Nilai berhasil dihapus!');
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
                if ($index === 0) continue;
                
                try {
                    $mahasiswa = Mahasiswa::where('nim', $row[0])->first();
                    $mataKuliah = MataKuliah::where('kode_mk', $row[1])->first();
                    
                    if (!$mahasiswa) {
                        $errors[] = "Baris " . ($index + 1) . ": Mahasiswa NIM '{$row[0]}' tidak ditemukan";
                        continue;
                    }
                    
                    if (!$mataKuliah) {
                        $errors[] = "Baris " . ($index + 1) . ": Mata Kuliah '{$row[1]}' tidak ditemukan";
                        continue;
                    }

                    $nilaiTugas = $row[4] ?? 0;
                    $nilaiUts = $row[5] ?? 0;
                    $nilaiUas = $row[6] ?? 0;
                    $nilaiAkhir = ($nilaiTugas * 0.3) + ($nilaiUts * 0.3) + ($nilaiUas * 0.4);
                    
                    if ($nilaiAkhir >= 85) $huruf = 'A';
                    elseif ($nilaiAkhir >= 70) $huruf = 'B';
                    elseif ($nilaiAkhir >= 60) $huruf = 'C';
                    elseif ($nilaiAkhir >= 50) $huruf = 'D';
                    else $huruf = 'E';

                    Nilai::create([
                        'mahasiswa_id' => $mahasiswa->id,
                        'mata_kuliah_id' => $mataKuliah->id,
                        'semester' => $row[2],
                        'tahun_ajaran' => $row[3],
                        'tugas' => $nilaiTugas,
                        'uts' => $nilaiUts,
                        'uas' => $nilaiUas,
                        'nilai_akhir' => round($nilaiAkhir, 2),
                        'grade' => $huruf
                    ]);
                    
                    $imported++;
                } catch (\Exception $e) {
                    $errors[] = "Baris " . ($index + 1) . ": " . $e->getMessage();
                }
            }
            
            DB::commit();
            
            $message = "Berhasil mengimpor {$imported} nilai";
            if (!empty($errors)) {
                return back()->with([
                    'success' => $message,
                    'import_errors' => $errors
                ]);
            }
            
            return back()->with('success', $message);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal mengimpor data: ' . $e->getMessage());
        }
    }

    public function downloadTemplate()
    {
        $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        
        $sheet->setCellValue('A1', 'NIM');
        $sheet->setCellValue('B1', 'Kode MK');
        $sheet->setCellValue('C1', 'Semester');
        $sheet->setCellValue('D1', 'Tahun Ajaran');
        $sheet->setCellValue('E1', 'Nilai Tugas');
        $sheet->setCellValue('F1', 'Nilai UTS');
        $sheet->setCellValue('G1', 'Nilai UAS');
        
        $sheet->setCellValue('A2', '123456789');
        $sheet->setCellValue('B2', 'TI101');
        $sheet->setCellValue('C2', '1');
        $sheet->setCellValue('D2', '2024/2025');
        $sheet->setCellValue('E2', '85');
        $sheet->setCellValue('F2', '80');
        $sheet->setCellValue('G2', '90');
        
        $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
        $filename = 'template_nilai_' . date('YmdHis') . '.xlsx';
        $temp_file = tempnam(sys_get_temp_dir(), $filename);
        $writer->save($temp_file);
        
        return response()->download($temp_file, $filename)->deleteFileAfterSend(true);
    }
}
