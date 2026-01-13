<?php

namespace App\Http\Controllers\Mahasiswa;

use App\Http\Controllers\Controller;
use App\Models\Mahasiswa;
use App\Models\Tugas;
use App\Models\PengumpulanTugas;
use App\Models\Jadwal;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class TugasController extends Controller
{
    public function index(Request $request)
    {
        $user = JWTAuth::user();
        $mahasiswa = Mahasiswa::where('user_id', $user->id)->first();

        if (!$mahasiswa) {
            return redirect('/login')->with('error', 'Data mahasiswa tidak ditemukan');
        }

        // Get mata kuliah yang diambil mahasiswa berdasarkan kelasnya
        $mataKuliahIds = Jadwal::where('kelas_id', $mahasiswa->kelas_id)
            ->pluck('mata_kuliah_id')
            ->unique();

        // Query tugas dengan filter
        $query = Tugas::whereIn('mata_kuliah_id', $mataKuliahIds)
            ->with(['mataKuliah', 'dosen']);

        // Filter by status
        if ($request->filled('status')) {
            if ($request->status === 'belum_dikumpulkan') {
                $query->whereDoesntHave('pengumpulanTugas', function($q) use ($mahasiswa) {
                    $q->where('mahasiswa_id', $mahasiswa->id);
                });
            } elseif ($request->status === 'sudah_dikumpulkan') {
                $query->whereHas('pengumpulanTugas', function($q) use ($mahasiswa) {
                    $q->where('mahasiswa_id', $mahasiswa->id);
                });
            }
        }

        // Filter by mata kuliah
        if ($request->filled('mata_kuliah_id')) {
            $query->where('mata_kuliah_id', $request->mata_kuliah_id);
        }

        // Search by judul
        if ($request->filled('search')) {
            $query->where('judul', 'like', '%' . $request->search . '%');
        }

        $tugas = $query->orderBy('deadline', 'desc')->paginate(12);

        // Add status pengumpulan untuk setiap tugas
        $tugas->getCollection()->transform(function ($item) use ($mahasiswa) {
            $pengumpulan = PengumpulanTugas::where('tugas_id', $item->id)
                ->where('mahasiswa_id', $mahasiswa->id)
                ->first();

            $item->pengumpulan = $pengumpulan;
            $item->status_pengumpulan = $pengumpulan ? 'Sudah Dikumpulkan' : 'Belum Dikumpulkan';
            $item->is_terlambat = !$pengumpulan && now() > $item->deadline;
            
            return $item;
        });

        // Get daftar mata kuliah untuk filter
        $mataKuliahList = Jadwal::where('kelas_id', $mahasiswa->kelas_id)
            ->with('mataKuliah')
            ->get()
            ->pluck('mataKuliah')
            ->unique('id')
            ->values();

        return Inertia::render('Mahasiswa/Tugas/Index', [
            'mahasiswa' => $mahasiswa,
            'tugas' => $tugas,
            'mataKuliahList' => $mataKuliahList,
            'filters' => [
                'status' => $request->status,
                'mata_kuliah_id' => $request->mata_kuliah_id,
                'search' => $request->search,
            ],
        ]);
    }

    public function show($id)
    {
        $user = JWTAuth::user();
        $mahasiswa = Mahasiswa::where('user_id', $user->id)->first();

        if (!$mahasiswa) {
            return redirect('/login')->with('error', 'Data mahasiswa tidak ditemukan');
        }

        $tugas = Tugas::with(['mataKuliah', 'dosen'])->findOrFail($id);

        // Verifikasi mahasiswa mengambil mata kuliah ini
        $hasAccess = Jadwal::where('kelas_id', $mahasiswa->kelas_id)
            ->where('mata_kuliah_id', $tugas->mata_kuliah_id)
            ->exists();

        if (!$hasAccess) {
            abort(403, 'Anda tidak memiliki akses ke tugas ini');
        }

        // Get pengumpulan tugas mahasiswa
        $pengumpulan = PengumpulanTugas::where('tugas_id', $tugas->id)
            ->where('mahasiswa_id', $mahasiswa->id)
            ->first();

        $tugas->pengumpulan = $pengumpulan;
        $tugas->is_terlambat = !$pengumpulan && now() > $tugas->deadline;

        return Inertia::render('Mahasiswa/Tugas/Show', [
            'mahasiswa' => $mahasiswa,
            'tugas' => $tugas,
        ]);
    }

    public function submit(Request $request, $id)
    {
        $user = JWTAuth::user();
        $mahasiswa = Mahasiswa::where('user_id', $user->id)->first();

        if (!$mahasiswa) {
            return redirect('/login')->with('error', 'Data mahasiswa tidak ditemukan');
        }

        $tugas = Tugas::findOrFail($id);

        // Verifikasi mahasiswa mengambil mata kuliah ini
        $hasAccess = Jadwal::where('kelas_id', $mahasiswa->kelas_id)
            ->where('mata_kuliah_id', $tugas->mata_kuliah_id)
            ->exists();

        if (!$hasAccess) {
            abort(403, 'Anda tidak memiliki akses ke tugas ini');
        }

        // Check if already submitted
        $existingSubmission = PengumpulanTugas::where('tugas_id', $tugas->id)
            ->where('mahasiswa_id', $mahasiswa->id)
            ->first();

        if ($existingSubmission) {
            return back()->with('error', 'Anda sudah mengumpulkan tugas ini');
        }

        $request->validate([
            'file' => 'required|file|max:10240', // 10MB
            'catatan' => 'nullable|string',
        ]);

        // Upload file
        $file = $request->file('file');
        $filename = Str::slug($mahasiswa->nim . '-' . $tugas->judul) . '-' . time() . '.' . $file->getClientOriginalExtension();
        $filePath = $file->storeAs('pengumpulan_tugas', $filename, 'public');

        // Create pengumpulan
        PengumpulanTugas::create([
            'tugas_id' => $tugas->id,
            'mahasiswa_id' => $mahasiswa->id,
            'file_path' => $filePath,
            'catatan' => $request->catatan,
            'tanggal_pengumpulan' => now(),
            'status' => now() > $tugas->deadline ? 'Terlambat' : 'Tepat Waktu',
        ]);

        return redirect()->route('mahasiswa.tugas.show', $id)
            ->with('success', 'Tugas berhasil dikumpulkan');
    }

    public function download($id)
    {
        $user = JWTAuth::user();
        $mahasiswa = Mahasiswa::where('user_id', $user->id)->first();

        if (!$mahasiswa) {
            return redirect('/login')->with('error', 'Data mahasiswa tidak ditemukan');
        }

        $tugas = Tugas::findOrFail($id);

        // Verifikasi mahasiswa mengambil mata kuliah ini
        $hasAccess = Jadwal::where('kelas_id', $mahasiswa->kelas_id)
            ->where('mata_kuliah_id', $tugas->mata_kuliah_id)
            ->exists();

        if (!$hasAccess) {
            abort(403, 'Anda tidak memiliki akses ke tugas ini');
        }

        if (!$tugas->file_path || !Storage::exists($tugas->file_path)) {
            return back()->with('error', 'File tidak ditemukan');
        }

        return Storage::download($tugas->file_path, $tugas->judul . '.' . pathinfo($tugas->file_path, PATHINFO_EXTENSION));
    }

    public function downloadPengumpulan($id)
    {
        $user = JWTAuth::user();
        $mahasiswa = Mahasiswa::where('user_id', $user->id)->first();

        if (!$mahasiswa) {
            return redirect('/login')->with('error', 'Data mahasiswa tidak ditemukan');
        }

        $pengumpulan = PengumpulanTugas::where('id', $id)
            ->where('mahasiswa_id', $mahasiswa->id)
            ->firstOrFail();

        if (!$pengumpulan->file_path || !Storage::exists($pengumpulan->file_path)) {
            return back()->with('error', 'File tidak ditemukan');
        }

        return Storage::download($pengumpulan->file_path);
    }
}
