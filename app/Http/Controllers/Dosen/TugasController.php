<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use App\Models\Tugas;
use App\Models\Dosen;
use App\Models\MataKuliah;
use App\Models\Jadwal;
use App\Models\PengumpulanTugas;
use App\Models\Mahasiswa;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class TugasController extends Controller
{
    public function index(Request $request)
    {
        $user = JWTAuth::user();
        $dosen = Dosen::where('user_id', $user->id)->first();

        if (!$dosen) {
            return redirect('/login')->with('error', 'Data dosen tidak ditemukan');
        }

        // Query tugas dengan filter
        $query = Tugas::where('dosen_id', $dosen->id)
            ->with(['mataKuliah', 'pengumpulanTugas']);

        // Filter by mata kuliah
        if ($request->filled('mata_kuliah_id')) {
            $query->where('mata_kuliah_id', $request->mata_kuliah_id);
        }

        // Search by judul
        if ($request->filled('search')) {
            $query->where('judul', 'like', '%' . $request->search . '%');
        }

        $tugas = $query->orderBy('deadline', 'desc')->paginate(10);

        // Hitung jumlah pengumpulan untuk setiap tugas
        $tugas->getCollection()->transform(function ($item) {
            $item->jumlah_pengumpulan = $item->pengumpulanTugas->count();
            
            // Hitung mahasiswa yang belum mengumpulkan
            $kelasIds = Jadwal::where('dosen_id', $item->dosen_id)
                ->where('mata_kuliah_id', $item->mata_kuliah_id)
                ->pluck('kelas_id');
            
            $totalMahasiswa = Mahasiswa::whereIn('kelas_id', $kelasIds)->count();
            $item->total_mahasiswa = $totalMahasiswa;
            $item->belum_mengumpulkan = $totalMahasiswa - $item->jumlah_pengumpulan;
            
            // Status deadline
            $now = now();
            if ($now->greaterThan($item->deadline)) {
                $item->status_deadline = 'expired';
            } else if ($now->diffInDays($item->deadline) <= 2) {
                $item->status_deadline = 'urgent';
            } else {
                $item->status_deadline = 'normal';
            }
            
            return $item;
        });

        // Get mata kuliah yang diampu oleh dosen ini
        $mataKuliahIds = Jadwal::where('dosen_id', $dosen->id)
            ->distinct()
            ->pluck('mata_kuliah_id');
        
        $mataKuliahList = MataKuliah::whereIn('id', $mataKuliahIds)
            ->get()
            ->map(function($mk) use ($dosen) {
                $kelasList = Jadwal::where('dosen_id', $dosen->id)
                    ->where('mata_kuliah_id', $mk->id)
                    ->with('kelas')
                    ->get()
                    ->pluck('kelas.nama_kelas')
                    ->unique()
                    ->values()
                    ->toArray();

                return [
                    'id' => $mk->id,
                    'kode_mk' => $mk->kode_mk,
                    'nama_mk' => $mk->nama_mk,
                    'sks' => $mk->sks,
                    'kelas' => $kelasList,
                ];
            });

        return Inertia::render('Dosen/Tugas/Index', [
            'tugas' => $tugas,
            'mataKuliahList' => $mataKuliahList,
            'filters' => [
                'mata_kuliah_id' => $request->mata_kuliah_id,
                'search' => $request->search,
            ],
        ]);
    }

    public function create()
    {
        $user = JWTAuth::user();
        $dosen = Dosen::where('user_id', $user->id)->first();

        if (!$dosen) {
            return redirect('/login')->with('error', 'Data dosen tidak ditemukan');
        }

        // Get mata kuliah yang diampu oleh dosen ini dengan info kelas
        $mataKuliahIds = Jadwal::where('dosen_id', $dosen->id)
            ->distinct()
            ->pluck('mata_kuliah_id');
        
        $mataKuliahList = MataKuliah::whereIn('id', $mataKuliahIds)
            ->get()
            ->map(function($mk) use ($dosen) {
                $kelasList = Jadwal::where('dosen_id', $dosen->id)
                    ->where('mata_kuliah_id', $mk->id)
                    ->with('kelas')
                    ->get()
                    ->pluck('kelas.nama_kelas')
                    ->unique()
                    ->values()
                    ->toArray();

                return [
                    'id' => $mk->id,
                    'kode_mk' => $mk->kode_mk,
                    'nama_mk' => $mk->nama_mk,
                    'sks' => $mk->sks,
                    'kelas' => $kelasList,
                ];
            })
            ->values();

        return Inertia::render('Dosen/Tugas/Create', [
            'mataKuliahList' => $mataKuliahList,
        ]);
    }

    public function store(Request $request)
    {
        $user = JWTAuth::user();
        $dosen = Dosen::where('user_id', $user->id)->first();

        if (!$dosen) {
            return redirect('/login')->with('error', 'Data dosen tidak ditemukan');
        }

        $request->validate([
            'mata_kuliah_id' => 'required|exists:mata_kuliah,id',
            'judul' => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'deadline' => 'required|date|after:now',
            'file' => 'nullable|file|mimes:pdf,doc,docx,ppt,pptx|max:10240', // 10MB
        ]);

        DB::beginTransaction();
        try {
            $data = [
                'mata_kuliah_id' => $request->mata_kuliah_id,
                'dosen_id' => $dosen->id,
                'judul' => $request->judul,
                'deskripsi' => $request->deskripsi,
                'deadline' => $request->deadline,
            ];

            // Handle file upload
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('tugas', $fileName, 'public');
                $data['file_path'] = $filePath;
            }

            Tugas::create($data);

            DB::commit();
            return redirect()->route('dosen.tugas.index')
                ->with('success', 'Tugas berhasil ditambahkan');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal menambahkan tugas: ' . $e->getMessage()]);
        }
    }

    public function show($id)
    {
        $user = JWTAuth::user();
        $dosen = Dosen::where('user_id', $user->id)->first();

        if (!$dosen) {
            return redirect('/login')->with('error', 'Data dosen tidak ditemukan');
        }

        $tugas = Tugas::where('id', $id)
            ->where('dosen_id', $dosen->id)
            ->with(['mataKuliah', 'dosen'])
            ->firstOrFail();

        // Get pengumpulan tugas dengan data mahasiswa
        $pengumpulan = PengumpulanTugas::where('tugas_id', $id)
            ->with(['mahasiswa.prodi', 'mahasiswa.kelas'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($item) use ($tugas) {
                $waktuPengumpulan = \Carbon\Carbon::parse($item->waktu_pengumpulan ?? $item->created_at);
                $deadline = \Carbon\Carbon::parse($tugas->deadline);
                
                return [
                    'id' => $item->id,
                    'mahasiswa' => [
                        'id' => $item->mahasiswa->id,
                        'nim' => $item->mahasiswa->nim,
                        'nama' => $item->mahasiswa->nama,
                        'prodi' => $item->mahasiswa->prodi->nama ?? '-',
                        'kelas' => $item->mahasiswa->kelas->nama_kelas ?? '-',
                    ],
                    'file_path' => $item->file_path,
                    'waktu_pengumpulan' => $waktuPengumpulan->format('d M Y H:i'),
                    'status' => $waktuPengumpulan->lessThanOrEqualTo($deadline) ? 'Tepat Waktu' : 'Terlambat',
                    'keterlambatan' => $waktuPengumpulan->greaterThan($deadline) 
                        ? $deadline->diffForHumans($waktuPengumpulan, true) 
                        : null,
                    'nilai' => $item->nilai,
                    'catatan' => $item->catatan,
                ];
            });

        // Hitung statistik
        $kelasIds = Jadwal::where('dosen_id', $dosen->id)
            ->where('mata_kuliah_id', $tugas->mata_kuliah_id)
            ->pluck('kelas_id');
        
        $totalMahasiswa = Mahasiswa::whereIn('kelas_id', $kelasIds)->count();
        $jumlahPengumpulan = $pengumpulan->count();
        $sudahDinilai = $pengumpulan->where('nilai', '!=', null)->count();
        $belumDinilai = $jumlahPengumpulan - $sudahDinilai;

        return Inertia::render('Dosen/Tugas/Show', [
            'tugas' => $tugas,
            'pengumpulan' => $pengumpulan,
            'statistik' => [
                'total_mahasiswa' => $totalMahasiswa,
                'jumlah_pengumpulan' => $jumlahPengumpulan,
                'belum_mengumpulkan' => $totalMahasiswa - $jumlahPengumpulan,
                'sudah_dinilai' => $sudahDinilai,
                'belum_dinilai' => $belumDinilai,
            ],
        ]);
    }

    public function edit($id)
    {
        $user = JWTAuth::user();
        $dosen = Dosen::where('user_id', $user->id)->first();

        if (!$dosen) {
            return redirect('/login')->with('error', 'Data dosen tidak ditemukan');
        }

        $tugas = Tugas::where('id', $id)
            ->where('dosen_id', $dosen->id)
            ->with(['mataKuliah'])
            ->firstOrFail();

        // Get mata kuliah yang diampu oleh dosen ini
        $mataKuliahIds = Jadwal::where('dosen_id', $dosen->id)
            ->distinct()
            ->pluck('mata_kuliah_id');
        
        $mataKuliahList = MataKuliah::whereIn('id', $mataKuliahIds)
            ->get()
            ->map(function($mk) use ($dosen) {
                $kelasList = Jadwal::where('dosen_id', $dosen->id)
                    ->where('mata_kuliah_id', $mk->id)
                    ->with('kelas')
                    ->get()
                    ->pluck('kelas.nama_kelas')
                    ->unique()
                    ->values()
                    ->toArray();

                return [
                    'id' => $mk->id,
                    'kode_mk' => $mk->kode_mk,
                    'nama_mk' => $mk->nama_mk,
                    'sks' => $mk->sks,
                    'kelas' => $kelasList,
                ];
            })
            ->values();

        return Inertia::render('Dosen/Tugas/Edit', [
            'tugas' => $tugas,
            'mataKuliahList' => $mataKuliahList,
        ]);
    }

    public function update(Request $request, $id)
    {
        $user = JWTAuth::user();
        $dosen = Dosen::where('user_id', $user->id)->first();

        if (!$dosen) {
            return redirect('/login')->with('error', 'Data dosen tidak ditemukan');
        }

        $tugas = Tugas::where('id', $id)
            ->where('dosen_id', $dosen->id)
            ->firstOrFail();

        $request->validate([
            'mata_kuliah_id' => 'required|exists:mata_kuliah,id',
            'judul' => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'deadline' => 'required|date',
            'file' => 'nullable|file|mimes:pdf,doc,docx,ppt,pptx|max:10240',
        ]);

        DB::beginTransaction();
        try {
            $data = [
                'mata_kuliah_id' => $request->mata_kuliah_id,
                'judul' => $request->judul,
                'deskripsi' => $request->deskripsi,
                'deadline' => $request->deadline,
            ];

            // Handle file upload
            if ($request->hasFile('file')) {
                // Delete old file
                if ($tugas->file_path && Storage::disk('public')->exists($tugas->file_path)) {
                    Storage::disk('public')->delete($tugas->file_path);
                }

                $file = $request->file('file');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('tugas', $fileName, 'public');
                $data['file_path'] = $filePath;
            }

            $tugas->update($data);

            DB::commit();
            return redirect()->route('dosen.tugas.index')
                ->with('success', 'Tugas berhasil diupdate');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal mengupdate tugas: ' . $e->getMessage()]);
        }
    }

    public function destroy($id)
    {
        $user = JWTAuth::user();
        $dosen = Dosen::where('user_id', $user->id)->first();

        if (!$dosen) {
            return redirect('/login')->with('error', 'Data dosen tidak ditemukan');
        }

        $tugas = Tugas::where('id', $id)
            ->where('dosen_id', $dosen->id)
            ->firstOrFail();

        DB::beginTransaction();
        try {
            // Delete file if exists
            if ($tugas->file_path && Storage::disk('public')->exists($tugas->file_path)) {
                Storage::disk('public')->delete($tugas->file_path);
            }

            // Delete pengumpulan files
            $pengumpulan = PengumpulanTugas::where('tugas_id', $id)->get();
            foreach ($pengumpulan as $p) {
                if ($p->file_path && Storage::disk('public')->exists($p->file_path)) {
                    Storage::disk('public')->delete($p->file_path);
                }
            }

            $tugas->delete();

            DB::commit();
            return redirect()->route('dosen.tugas.index')
                ->with('success', 'Tugas berhasil dihapus');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal menghapus tugas: ' . $e->getMessage()]);
        }
    }

    public function download($id)
    {
        $user = JWTAuth::user();
        $dosen = Dosen::where('user_id', $user->id)->first();

        if (!$dosen) {
            return redirect('/login')->with('error', 'Data dosen tidak ditemukan');
        }

        $tugas = Tugas::where('id', $id)
            ->where('dosen_id', $dosen->id)
            ->firstOrFail();

        if (!$tugas->file_path || !Storage::disk('public')->exists($tugas->file_path)) {
            return back()->withErrors(['error' => 'File tidak ditemukan']);
        }

        $filePath = Storage::disk('public')->path($tugas->file_path);
        $fileName = basename($tugas->file_path);
        
        return response()->download($filePath, $fileName);
    }

    public function downloadPengumpulan($id)
    {
        $user = JWTAuth::user();
        $dosen = Dosen::where('user_id', $user->id)->first();

        if (!$dosen) {
            return redirect('/login')->with('error', 'Data dosen tidak ditemukan');
        }

        $pengumpulan = PengumpulanTugas::where('id', $id)
            ->whereHas('tugas', function($q) use ($dosen) {
                $q->where('dosen_id', $dosen->id);
            })
            ->firstOrFail();

        if (!$pengumpulan->file_path || !Storage::disk('public')->exists($pengumpulan->file_path)) {
            return back()->withErrors(['error' => 'File tidak ditemukan']);
        }

        $filePath = Storage::disk('public')->path($pengumpulan->file_path);
        $fileName = basename($pengumpulan->file_path);
        
        return response()->download($filePath, $fileName);
    }

    public function nilai(Request $request, $id)
    {
        $user = JWTAuth::user();
        $dosen = Dosen::where('user_id', $user->id)->first();

        if (!$dosen) {
            return response()->json(['error' => 'Data dosen tidak ditemukan'], 403);
        }

        $pengumpulan = PengumpulanTugas::where('id', $id)
            ->whereHas('tugas', function($q) use ($dosen) {
                $q->where('dosen_id', $dosen->id);
            })
            ->firstOrFail();

        $request->validate([
            'nilai' => 'required|numeric|min:0|max:100',
            'catatan' => 'nullable|string',
        ]);

        $pengumpulan->update([
            'nilai' => $request->nilai,
            'catatan' => $request->catatan,
        ]);

        return back()->with('success', 'Nilai berhasil disimpan');
    }
}
