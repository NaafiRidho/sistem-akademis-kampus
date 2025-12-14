<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Fakultas;
use App\Models\Prodi;
use App\Models\Dosen;
use App\Models\Mahasiswa;
use App\Models\User;
use App\Models\Absensi;
use App\Models\Nilai;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'total_mahasiswa' => Mahasiswa::count(),
            'total_dosen' => Dosen::count(),
            'total_fakultas' => Fakultas::count(),
            'total_prodi' => Prodi::count(),
        ];

        // Statistik Absensi
        $absensi_stats = [
            'hadir' => Absensi::where('status', 'hadir')->count(),
            'sakit' => Absensi::where('status', 'sakit')->count(),
            'izin' => Absensi::where('status', 'izin')->count(),
            'alpha' => Absensi::where('status', 'alpha')->count(),
        ];

        // Grafik Nilai - Distribusi nilai mahasiswa
        $nilai_distribusi = Nilai::select(
            DB::raw('COUNT(*) as jumlah'),
            DB::raw('CASE 
                WHEN nilai_akhir >= 85 THEN "A" 
                WHEN nilai_akhir >= 70 THEN "B" 
                WHEN nilai_akhir >= 60 THEN "C" 
                WHEN nilai_akhir >= 50 THEN "D" 
                ELSE "E" 
            END as grade')
        )
        ->whereNotNull('nilai_akhir')
        ->groupBy(DB::raw('CASE 
                WHEN nilai_akhir >= 85 THEN "A" 
                WHEN nilai_akhir >= 70 THEN "B" 
                WHEN nilai_akhir >= 60 THEN "C" 
                WHEN nilai_akhir >= 50 THEN "D" 
                ELSE "E" 
            END'))
        ->get()
        ->pluck('jumlah', 'grade');

        $grafik_nilai = [
            'A' => $nilai_distribusi['A'] ?? 0,
            'B' => $nilai_distribusi['B'] ?? 0,
            'C' => $nilai_distribusi['C'] ?? 0,
            'D' => $nilai_distribusi['D'] ?? 0,
            'E' => $nilai_distribusi['E'] ?? 0,
        ];

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'absensi_stats' => $absensi_stats,
            'grafik_nilai' => $grafik_nilai,
        ]);
    }
}
