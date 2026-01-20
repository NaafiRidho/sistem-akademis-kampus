<?php

namespace App\Http\Controllers\Mahasiswa;

use App\Http\Controllers\Controller;
use App\Models\Mahasiswa;
use App\Models\Jadwal;
use App\Models\Kelas;
use App\Models\Absensi;
use App\Models\Nilai;
use App\Models\Tugas;
use App\Models\PengumpulanTugas;
use App\Models\Pengumuman;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Tymon\JWTAuth\Facades\JWTAuth;

class DashboardController extends Controller
{
    public function index()
    {
        $user = JWTAuth::user();
        $mahasiswa = Mahasiswa::where('user_id', $user->id)
            ->with(['prodi.fakultas', 'kelas'])
            ->first();

        if (!$mahasiswa) {
            return redirect('/login')->with('error', 'Data mahasiswa tidak ditemukan');
        }

        // Get jadwal hari ini
        $today = now()->locale('id')->dayName;
        $jadwalHariIni = Jadwal::where('kelas_id', $mahasiswa->kelas_id)
            ->where('hari', $today)
            ->with(['mataKuliah', 'dosen', 'kelas.prodi'])
            ->orderBy('jam_mulai')
            ->get();

        // Get tugas yang belum dikumpulkan
        $kelasIds = [$mahasiswa->kelas_id];
        $tugasAktif = Tugas::whereHas('mataKuliah.jadwal', function($query) use ($kelasIds) {
                $query->whereIn('kelas_id', $kelasIds);
            })
            ->where('deadline', '>=', now())
            ->whereDoesntHave('pengumpulanTugas', function($query) use ($mahasiswa) {
                $query->where('mahasiswa_id', $mahasiswa->id);
            })
            ->with(['mataKuliah', 'dosen'])
            ->orderBy('deadline')
            ->limit(5)
            ->get();

        // Statistik absensi
        $totalAbsensi = Absensi::where('mahasiswa_id', $mahasiswa->id)->count();
        $hadir = Absensi::where('mahasiswa_id', $mahasiswa->id)->where('status', 'Hadir')->count();
        $sakit = Absensi::where('mahasiswa_id', $mahasiswa->id)->where('status', 'Sakit')->count();
        $izin = Absensi::where('mahasiswa_id', $mahasiswa->id)->where('status', 'Izin')->count();
        $alpha = Absensi::where('mahasiswa_id', $mahasiswa->id)->where('status', 'Alpha')->count();
        
        $persentaseKehadiran = $totalAbsensi > 0 ? round(($hadir / $totalAbsensi) * 100, 2) : 0;

        // Statistik nilai
        $nilaiTertinggi = Nilai::where('mahasiswa_id', $mahasiswa->id)->max('nilai_akhir');
        $nilaiTerendah = Nilai::where('mahasiswa_id', $mahasiswa->id)->min('nilai_akhir');
        $rataRataNilai = Nilai::where('mahasiswa_id', $mahasiswa->id)->avg('nilai_akhir');
        $totalMataKuliah = Nilai::where('mahasiswa_id', $mahasiswa->id)->count();

        // Statistik tugas
        $totalTugas = PengumpulanTugas::where('mahasiswa_id', $mahasiswa->id)->count();
        $tugasDinilai = PengumpulanTugas::where('mahasiswa_id', $mahasiswa->id)
            ->whereNotNull('nilai')
            ->count();
        $tugasBelumDinilai = $totalTugas - $tugasDinilai;

        // Count unread announcements
        $unreadPengumumanCount = Pengumuman::whereIn('target_role', ['Mahasiswa', 'Semua'])
            ->whereDoesntHave('readers', function($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->count();

        return Inertia::render('Mahasiswa/Dashboard', [
            'mahasiswa' => $mahasiswa,
            'jadwalHariIni' => $jadwalHariIni,
            'tugasAktif' => $tugasAktif,
            'unreadPengumumanCount' => $unreadPengumumanCount,
            'stats' => [
                'persentase_kehadiran' => $persentaseKehadiran,
                'total_absensi' => $totalAbsensi,
                'hadir' => $hadir,
                'sakit' => $sakit,
                'izin' => $izin,
                'alpha' => $alpha,
                'nilai_tertinggi' => $nilaiTertinggi ?? 0,
                'nilai_terendah' => $nilaiTerendah ?? 0,
                'rata_rata_nilai' => $rataRataNilai ? round($rataRataNilai, 2) : 0,
                'total_mata_kuliah' => $totalMataKuliah,
                'total_tugas' => $totalTugas,
                'tugas_dinilai' => $tugasDinilai,
                'tugas_belum_dinilai' => $tugasBelumDinilai,
            ],
        ]);
    }
}
