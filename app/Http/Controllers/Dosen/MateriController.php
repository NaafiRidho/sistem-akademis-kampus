<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use App\Models\Materi;
use App\Models\Dosen;
use App\Models\MataKuliah;
use App\Models\Jadwal;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MateriController extends Controller
{
    public function index(Request $request)
    {
        $user = JWTAuth::user();
        $dosen = Dosen::where('user_id', $user->id)->first();

        if (!$dosen) {
            return redirect('/login')->with('error', 'Data dosen tidak ditemukan');
        }

        // Query materi dengan filter
        $query = Materi::where('dosen_id', $dosen->id)
            ->with(['mataKuliah', 'dosen']);

        // Filter by mata kuliah
        if ($request->filled('mata_kuliah_id')) {
            $query->where('mata_kuliah_id', $request->mata_kuliah_id);
        }

        // Filter by kelas - perlu join dengan jadwal
        if ($request->filled('kelas')) {
            $query->whereHas('mataKuliah.jadwal', function ($q) use ($request, $dosen) {
                $q->where('dosen_id', $dosen->id)
                    ->whereHas('kelas', function ($kq) use ($request) {
                        $kq->where('nama_kelas', $request->kelas);
                    });
            });
        }

        $materi = $query->orderBy('created_at', 'desc')->paginate(10);

        // Get mata kuliah yang diampu oleh dosen ini dengan info kelas
        $jadwalDosen = Jadwal::where('dosen_id', $dosen->id)
            ->with(['mataKuliah', 'kelas'])
            ->get();

        // Group by mata kuliah dan collect kelas-kelasnya
        $mataKuliahData = [];
        $processedIds = [];

        foreach ($jadwalDosen as $jadwal) {
            $mataKuliah = $jadwal->mataKuliah;

            // Skip jika mata kuliah null atau sudah diproses
            if (!$mataKuliah || in_array($mataKuliah->id, $processedIds)) {
                continue;
            }

            // Ambil semua kelas untuk mata kuliah ini
            $kelasList = $jadwalDosen
                ->where('mata_kuliah_id', $mataKuliah->id)
                ->map(function ($j) {
                    return $j->kelas ? $j->kelas->nama_kelas : null;
                })
                ->filter()
                ->unique()
                ->values()
                ->toArray();

            $mataKuliahData[] = [
                'id' => $mataKuliah->id,
                'kode_mk' => $mataKuliah->kode_mk ?? '',
                'nama_mk' => $mataKuliah->nama_mk ?? '',
                'sks' => $mataKuliah->sks ?? 0,
                'kelas' => $kelasList,
            ];

            $processedIds[] = $mataKuliah->id;
        }

        return Inertia::render('Dosen/Materi/Index', [
            'materi' => $materi,
            'mataKuliahList' => $mataKuliahData,
            'filters' => [
                'mata_kuliah_id' => $request->mata_kuliah_id,
                'kelas' => $request->kelas,
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
        $jadwalDosen = Jadwal::where('dosen_id', $dosen->id)
            ->with(['mataKuliah', 'kelas'])
            ->get();

        // Group by mata kuliah dan collect kelas-kelasnya
        $mataKuliahData = [];
        $processedIds = [];

        foreach ($jadwalDosen as $jadwal) {
            $mataKuliah = $jadwal->mataKuliah;

            // Skip jika mata kuliah null atau sudah diproses
            if (!$mataKuliah || in_array($mataKuliah->id, $processedIds)) {
                continue;
            }

            // Ambil semua kelas untuk mata kuliah ini
            $kelasList = $jadwalDosen
                ->where('mata_kuliah_id', $mataKuliah->id)
                ->map(function ($j) {
                    return $j->kelas ? $j->kelas->nama_kelas : null;
                })
                ->filter()
                ->unique()
                ->values()
                ->toArray();

            $mataKuliahData[] = [
                'id' => $mataKuliah->id,
                'kode_mk' => $mataKuliah->kode_mk ?? '',
                'nama_mk' => $mataKuliah->nama_mk ?? '',
                'sks' => $mataKuliah->sks ?? 0,
                'kelas' => $kelasList,
            ];

            $processedIds[] = $mataKuliah->id;
        }

        return Inertia::render('Dosen/Materi/Create', [
            'mataKuliahList' => $mataKuliahData,
        ]);
    }

    public function store(Request $request)
    {
        $user = JWTAuth::user();
        $dosen = Dosen::where('user_id', $user->id)->first();

        if (!$dosen) {
            return back()->with('error', 'Data dosen tidak ditemukan');
        }

        $request->validate([
            'mata_kuliah_id' => 'required|exists:mata_kuliah,id',
            'judul' => 'required|string|max:255',
            'file' => 'required|file|mimes:pdf,ppt,pptx,doc,docx|max:10240', // max 10MB
        ]);

        try {
            // Upload file
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $fileName = time() . '_' . Str::slug($request->judul) . '.' . $file->getClientOriginalExtension();

                // Simpan file ke storage/app/public/materi
                $filePath = $file->storeAs('materi', $fileName, 'public');

                // Simpan data materi ke database
                Materi::create([
                    'mata_kuliah_id' => $request->mata_kuliah_id,
                    'dosen_id' => $dosen->id,
                    'judul' => $request->judul,
                    'file' => $filePath,
                ]);

                return redirect()->route('dosen.materi.index')->with('success', 'Materi berhasil diupload');
            }

            return back()->with('error', 'File tidak ditemukan');
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal mengupload materi: ' . $e->getMessage());
        }
    }

    public function destroy($id)
    {
        $user = JWTAuth::user();
        $dosen = Dosen::where('user_id', $user->id)->first();

        if (!$dosen) {
            return back()->with('error', 'Data dosen tidak ditemukan');
        }

        $materi = Materi::where('id', $id)
            ->where('dosen_id', $dosen->id)
            ->first();

        if (!$materi) {
            return back()->with('error', 'Materi tidak ditemukan');
        }

        try {
            // Hapus file dari storage
            if ($materi->file && Storage::disk('public')->exists($materi->file)) {
                Storage::disk('public')->delete($materi->file);
            }

            // Hapus data dari database
            $materi->delete();

            return redirect()->route('dosen.materi.index')->with('success', 'Materi berhasil dihapus');
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal menghapus materi: ' . $e->getMessage());
        }
    }

    public function download($id)
    {
        $user = JWTAuth::user();
        $dosen = Dosen::where('user_id', $user->id)->first();

        if (!$dosen) {
            return back()->with('error', 'Data dosen tidak ditemukan');
        }

        $materi = Materi::where('id', $id)
            ->where('dosen_id', $dosen->id)
            ->first();

        if (!$materi) {
            return back()->with('error', 'Materi tidak ditemukan');
        }

        if (!$materi->file || !Storage::disk('public')->exists($materi->file)) {
            return back()->with('error', 'File tidak ditemukan');
        }

        $filePath = storage_path('app/public/' . $materi->file);
        return response()->download($filePath, basename($materi->file));
    }
}
