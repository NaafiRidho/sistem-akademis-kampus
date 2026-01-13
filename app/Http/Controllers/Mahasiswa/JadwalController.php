<?php

namespace App\Http\Controllers\Mahasiswa;

use App\Http\Controllers\Controller;
use App\Models\Mahasiswa;
use App\Models\Jadwal;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Tymon\JWTAuth\Facades\JWTAuth;

class JadwalController extends Controller
{
    public function index(Request $request)
    {
        $user = JWTAuth::user();
        $mahasiswa = Mahasiswa::where('user_id', $user->id)->first();

        if (!$mahasiswa) {
            return redirect('/login')->with('error', 'Data mahasiswa tidak ditemukan');
        }

        // Get jadwal berdasarkan kelas mahasiswa
        $query = Jadwal::where('kelas_id', $mahasiswa->kelas_id)
            ->with(['mataKuliah', 'dosen', 'kelas.prodi']);

        // Filter by hari
        if ($request->filled('hari')) {
            $query->where('hari', $request->hari);
        }

        $jadwal = $query->orderByRaw("
            FIELD(hari, 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu')
        ")->orderBy('jam_mulai')->get();

        // Group jadwal by hari
        $jadwalGrouped = $jadwal->groupBy('hari');

        return Inertia::render('Mahasiswa/Jadwal/Index', [
            'mahasiswa' => $mahasiswa,
            'jadwal' => $jadwal,
            'jadwalGrouped' => $jadwalGrouped,
            'filters' => [
                'hari' => $request->hari,
            ],
        ]);
    }
}
