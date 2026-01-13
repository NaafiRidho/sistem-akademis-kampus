<?php

namespace App\Http\Controllers\Mahasiswa;

use App\Http\Controllers\Controller;
use App\Models\Mahasiswa;
use App\Models\Materi;
use App\Models\Jadwal;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\Storage;

class MateriController extends Controller
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

        // Query materi dengan filter
        $query = Materi::whereIn('mata_kuliah_id', $mataKuliahIds)
            ->with(['mataKuliah', 'dosen']);

        // Filter by mata kuliah
        if ($request->filled('mata_kuliah_id')) {
            $query->where('mata_kuliah_id', $request->mata_kuliah_id);
        }

        // Search by judul
        if ($request->filled('search')) {
            $query->where('judul', 'like', '%' . $request->search . '%');
        }

        $materi = $query->orderBy('created_at', 'desc')->paginate(12);

        // Get daftar mata kuliah untuk filter
        $mataKuliahList = Jadwal::where('kelas_id', $mahasiswa->kelas_id)
            ->with('mataKuliah')
            ->get()
            ->pluck('mataKuliah')
            ->unique('id')
            ->values();

        return Inertia::render('Mahasiswa/Materi/Index', [
            'mahasiswa' => $mahasiswa,
            'materi' => $materi,
            'mataKuliahList' => $mataKuliahList,
            'filters' => [
                'mata_kuliah_id' => $request->mata_kuliah_id,
                'search' => $request->search,
            ],
        ]);
    }

    public function download($id)
    {
        $user = JWTAuth::user();
        $mahasiswa = Mahasiswa::where('user_id', $user->id)->first();

        if (!$mahasiswa) {
            return redirect('/login')->with('error', 'Data mahasiswa tidak ditemukan');
        }

        $materi = Materi::findOrFail($id);

        // Verifikasi mahasiswa mengambil mata kuliah ini
        $hasAccess = Jadwal::where('kelas_id', $mahasiswa->kelas_id)
            ->where('mata_kuliah_id', $materi->mata_kuliah_id)
            ->exists();

        if (!$hasAccess) {
            abort(403, 'Anda tidak memiliki akses ke materi ini');
        }

        if (!$materi->file_path || !Storage::exists($materi->file_path)) {
            return back()->with('error', 'File tidak ditemukan');
        }

        return Storage::download($materi->file_path, $materi->judul . '.' . pathinfo($materi->file_path, PATHINFO_EXTENSION));
    }
}
