<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Absensi;
use App\Models\Mahasiswa;
use App\Models\Jadwal;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\IOFactory;

class AbsensiController extends Controller
{
    public function index(Request $request)
    {
        $query = Absensi::with(['mahasiswa.prodi', 'jadwal.kelas.mataKuliah']);

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->whereHas('mahasiswa', function($q) use ($search) {
                    $q->where('nama', 'like', "%{$search}%")
                      ->orWhere('nim', 'like', "%{$search}%");
                })
                ->orWhereHas('jadwal.kelas.mataKuliah', function($q) use ($search) {
                    $q->where('nama_mk', 'like', "%{$search}%");
                });
            });
        }

        // Filter by mahasiswa
        if ($request->has('mahasiswa_id') && $request->mahasiswa_id) {
            $query->where('mahasiswa_id', $request->mahasiswa_id);
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Filter by tanggal
        if ($request->has('tanggal') && $request->tanggal) {
            $query->whereDate('tanggal', $request->tanggal);
        }

        $absensi = $query->orderBy('tanggal', 'desc')->paginate(15);
        $mahasiswa = Mahasiswa::with('prodi')->get();
        $jadwal = Jadwal::with(['kelas.mataKuliah'])->get();

        return Inertia::render('Admin/Absensi/Index', [
            'absensi' => $absensi,
            'mahasiswa' => $mahasiswa,
            'jadwal' => $jadwal,
            'filters' => $request->only(['search', 'mahasiswa_id', 'status', 'tanggal'])
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'mahasiswa_id' => 'required|exists:mahasiswa,id',
            'jadwal_id' => 'required|exists:jadwal,id',
            'tanggal' => 'required|date',
            'status' => 'required|in:Hadir,Izin,Sakit,Alpa',
            'keterangan' => 'nullable|string|max:255'
        ]);

        // Check if absensi already exists
        $exists = Absensi::where('mahasiswa_id', $validated['mahasiswa_id'])
            ->where('jadwal_id', $validated['jadwal_id'])
            ->where('tanggal', $validated['tanggal'])
            ->exists();

        if ($exists) {
            return back()->with('error', 'Absensi untuk mahasiswa ini sudah tercatat pada jadwal dan tanggal tersebut!');
        }

        Absensi::create($validated);

        return back()->with('success', 'Absensi berhasil ditambahkan!');
    }

    public function update(Request $request, Absensi $absensi)
    {
        $validated = $request->validate([
            'mahasiswa_id' => 'required|exists:mahasiswa,id',
            'jadwal_id' => 'required|exists:jadwal,id',
            'tanggal' => 'required|date',
            'status' => 'required|in:Hadir,Izin,Sakit,Alpa',
            'keterangan' => 'nullable|string|max:255'
        ]);

        $absensi->update($validated);

        return back()->with('success', 'Absensi berhasil diperbarui!');
    }

    public function destroy(Absensi $absensi)
    {
        $absensi->delete();
        return back()->with('success', 'Absensi berhasil dihapus!');
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
                    $jadwal = Jadwal::find($row[1]);
                    
                    if (!$mahasiswa) {
                        $errors[] = "Baris " . ($index + 1) . ": Mahasiswa NIM '{$row[0]}' tidak ditemukan";
                        continue;
                    }
                    
                    if (!$jadwal) {
                        $errors[] = "Baris " . ($index + 1) . ": Jadwal ID '{$row[1]}' tidak ditemukan";
                        continue;
                    }

                    Absensi::create([
                        'mahasiswa_id' => $mahasiswa->id,
                        'jadwal_id' => $jadwal->id,
                        'tanggal' => $row[2],
                        'status' => $row[3],
                        'keterangan' => $row[4] ?? null
                    ]);
                    
                    $imported++;
                } catch (\Exception $e) {
                    $errors[] = "Baris " . ($index + 1) . ": " . $e->getMessage();
                }
            }
            
            DB::commit();
            
            $message = "Berhasil mengimpor {$imported} data absensi";
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
        $sheet->setCellValue('B1', 'Jadwal ID');
        $sheet->setCellValue('C1', 'Tanggal');
        $sheet->setCellValue('D1', 'Status');
        $sheet->setCellValue('E1', 'Keterangan');
        
        $sheet->setCellValue('A2', '123456789');
        $sheet->setCellValue('B2', '1');
        $sheet->setCellValue('C2', date('Y-m-d'));
        $sheet->setCellValue('D2', 'Hadir');
        $sheet->setCellValue('E2', '');
        
        $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
        $filename = 'template_absensi_' . date('YmdHis') . '.xlsx';
        $temp_file = tempnam(sys_get_temp_dir(), $filename);
        $writer->save($temp_file);
        
        return response()->download($temp_file, $filename)->deleteFileAfterSend(true);
    }

    // Rekap kehadiran per mahasiswa
    public function rekap(Request $request, $mahasiswaId)
    {
        $mahasiswa = Mahasiswa::with('prodi')->findOrFail($mahasiswaId);
        
        $rekap = Absensi::where('mahasiswa_id', $mahasiswaId)
            ->selectRaw('
                jadwal_id,
                COUNT(*) as total_pertemuan,
                SUM(CASE WHEN status = "Hadir" THEN 1 ELSE 0 END) as hadir,
                SUM(CASE WHEN status = "Izin" THEN 1 ELSE 0 END) as izin,
                SUM(CASE WHEN status = "Sakit" THEN 1 ELSE 0 END) as sakit,
                SUM(CASE WHEN status = "Alpa" THEN 1 ELSE 0 END) as alpa
            ')
            ->with(['jadwal.kelas.mataKuliah'])
            ->groupBy('jadwal_id')
            ->get();

        return Inertia::render('Admin/Absensi/Rekap', [
            'mahasiswa' => $mahasiswa,
            'rekap' => $rekap
        ]);
    }
}
