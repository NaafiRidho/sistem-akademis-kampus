<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use App\Models\Jadwal;
use App\Models\Dosen;
use App\Models\Nilai;
use App\Models\Absensi;
use App\Models\MataKuliah;
use App\Models\Pengumuman;
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
            ->with(['mataKuliah', 'kelas'])
            ->orderBy('jam_mulai')
            ->get();

        // Transform jadwal untuk frontend
        $jadwalTransformed = $jadwalHariIni->map(function($item) {
            return [
                'id' => $item->id,
                'hari' => $item->hari,
                'jam_mulai' => date('H:i', strtotime($item->jam_mulai)),
                'jam_selesai' => date('H:i', strtotime($item->jam_selesai)),
                'ruangan' => $item->ruangan,
                'mata_kuliah' => [
                    'id' => $item->mataKuliah->id,
                    'nama' => $item->mataKuliah->nama_mk,
                    'kode' => $item->mataKuliah->kode_mk,
                    'sks' => $item->mataKuliah->sks,
                ],
                'kelas' => [
                    'id' => $item->kelas->id,
                    'nama_kelas' => $item->kelas->nama_kelas,
                ],
            ];
        });

        // Get recent activities
        $recentNilai = Nilai::whereHas('mataKuliah.jadwal', function($q) use ($dosen) {
                $q->where('dosen_id', $dosen->id);
            })
            ->with(['mahasiswa', 'mataKuliah'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function($item) {
                return [
                    'id' => $item->id,
                    'nilai' => $item->nilai,
                    'grade' => $item->grade,
                    'mahasiswa' => [
                        'id' => $item->mahasiswa->id,
                        'nim' => $item->mahasiswa->nim,
                        'nama' => $item->mahasiswa->nama,
                    ],
                    'mata_kuliah' => [
                        'id' => $item->mataKuliah->id,
                        'nama' => $item->mataKuliah->nama_mk,
                        'kode' => $item->mataKuliah->kode_mk,
                    ],
                ];
            });

        // Count unread announcements
        $unreadPengumumanCount = Pengumuman::whereIn('target_role', ['Dosen', 'Semua'])
            ->whereDoesntHave('readers', function($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->count();

        return Inertia::render('Dosen/Dashboard', [
            'dosen' => $dosen,
            'unreadPengumumanCount' => $unreadPengumumanCount,
            'stats' => [
                'total_mata_kuliah' => $totalMataKuliah,
                'total_kelas' => $totalKelas,
                'total_mahasiswa' => $totalMahasiswa,
                'jadwal_hari_ini' => $jadwalTransformed->count(),
            ],
            'jadwal_hari_ini' => $jadwalTransformed,
            'recent_nilai' => $recentNilai,
            'hari' => $hariIni,
        ]);
    }
}
