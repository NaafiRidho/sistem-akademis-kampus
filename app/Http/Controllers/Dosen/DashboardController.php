<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use App\Models\Jadwal;
use App\Models\Dosen;
use App\Models\Nilai;
use App\Models\Absensi;
use App\Models\MataKuliah;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Tymon\JWTAuth\Facades\JWTAuth;

class DashboardController extends Controller
{
    public function index()
    {
        $user = JWTAuth::user();
        $dosen = Dosen::where('user_id', $user->id)->with('prodi')->first();

        if (!$dosen) {
            return redirect('/login')->with('error', 'Data dosen tidak ditemukan');
        }

        // Get statistik untuk dosen
        $totalMataKuliah = Jadwal::where('dosen_id', $dosen->id)
            ->distinct('mata_kuliah_id')
            ->count('mata_kuliah_id');

        $totalKelas = Jadwal::where('dosen_id', $dosen->id)
            ->distinct('kelas_id')
            ->count('kelas_id');

        $totalMahasiswa = Jadwal::where('dosen_id', $dosen->id)
            ->with('kelas.mahasiswa')
            ->get()
            ->pluck('kelas.mahasiswa')
            ->flatten()
            ->unique('id')
            ->count();

        // Get jadwal hari ini
        $hariIni = now()->locale('id')->dayName;
        $jadwalHariIni = Jadwal::where('dosen_id', $dosen->id)
            ->where('hari', $hariIni)
            ->with(['mataKuliah', 'kelas', 'ruangan'])
            ->orderBy('jam_mulai')
            ->get();

        // Get recent activities
        $recentNilai = Nilai::whereHas('mataKuliah.jadwal', function($q) use ($dosen) {
                $q->where('dosen_id', $dosen->id);
            })
            ->with(['mahasiswa', 'mataKuliah'])
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('Dosen/Dashboard', [
            'dosen' => $dosen,
            'stats' => [
                'total_mata_kuliah' => $totalMataKuliah,
                'total_kelas' => $totalKelas,
                'total_mahasiswa' => $totalMahasiswa,
                'jadwal_hari_ini' => $jadwalHariIni->count(),
            ],
            'jadwal_hari_ini' => $jadwalHariIni,
            'recent_nilai' => $recentNilai,
            'hari' => $hariIni,
        ]);
    }
}
