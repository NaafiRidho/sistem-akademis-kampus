<?php

namespace App\Http\Controllers\Mahasiswa;

use App\Http\Controllers\Controller;
use App\Models\Nilai;
use App\Models\Mahasiswa;
use App\Models\MataKuliah;
use App\Models\Jadwal;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Tymon\JWTAuth\Facades\JWTAuth;

class NilaiController extends Controller
{
    public function index(Request $request)
    {
        $user = JWTAuth::user();
        $mahasiswa = Mahasiswa::where('user_id', $user->id)
            ->with(['prodi', 'kelas'])
            ->first();

        if (!$mahasiswa) {
            return redirect('/login')->with('error', 'Data mahasiswa tidak ditemukan');
        }

        // Get mata kuliah yang diambil mahasiswa (berdasarkan jadwal kelas)
        $mataKuliahIds = Jadwal::where('kelas_id', $mahasiswa->kelas_id)
            ->distinct()
            ->pluck('mata_kuliah_id');

        // Query nilai
        $query = Nilai::where('mahasiswa_id', $mahasiswa->id)
            ->with(['mataKuliah']);

        // Filter by mata kuliah
        if ($request->filled('mata_kuliah_id')) {
            $query->where('mata_kuliah_id', $request->mata_kuliah_id);
        }

        // Filter by semester
        if ($request->filled('semester')) {
            $query->where('semester', $request->semester);
        }

        // Filter by tahun ajaran
        if ($request->filled('tahun_ajaran')) {
            $query->where('tahun_ajaran', $request->tahun_ajaran);
        }

        $nilai = $query->orderBy('created_at', 'desc')->paginate(15);

        // Transform data
        $nilai->getCollection()->transform(function($item) {
            return [
                'id' => $item->id,
                'mata_kuliah' => [
                    'id' => $item->mataKuliah->id,
                    'nama' => $item->mataKuliah->nama_mk,
                    'kode' => $item->mataKuliah->kode_mk,
                    'sks' => $item->mataKuliah->sks,
                ],
                'semester' => $item->semester,
                'tahun_ajaran' => $item->tahun_ajaran,
                'tugas' => $item->tugas,
                'uts' => $item->uts,
                'uas' => $item->uas,
                'nilai_akhir' => $item->nilai_akhir,
                'grade' => $item->grade,
            ];
        });

        // Get mata kuliah list untuk filter
        $mataKuliahList = MataKuliah::whereIn('id', $mataKuliahIds)->get();

        // Statistik nilai
        $nilaiTertinggi = Nilai::where('mahasiswa_id', $mahasiswa->id)->max('nilai_akhir');
        $nilaiTerendah = Nilai::where('mahasiswa_id', $mahasiswa->id)->min('nilai_akhir');
        $rataRataNilai = Nilai::where('mahasiswa_id', $mahasiswa->id)->avg('nilai_akhir');
        $totalMataKuliah = Nilai::where('mahasiswa_id', $mahasiswa->id)->count();

        $stats = [
            'nilai_tertinggi' => $nilaiTertinggi ?? 0,
            'nilai_terendah' => $nilaiTerendah ?? 0,
            'rata_rata' => $rataRataNilai ? round($rataRataNilai, 2) : 0,
            'total_mata_kuliah' => $totalMataKuliah,
        ];

        return Inertia::render('Mahasiswa/Nilai/Index', [
            'mahasiswa' => $mahasiswa,
            'nilai' => $nilai,
            'mataKuliahList' => $mataKuliahList,
            'stats' => $stats,
            'filters' => [
                'mata_kuliah_id' => $request->mata_kuliah_id,
                'semester' => $request->semester,
                'tahun_ajaran' => $request->tahun_ajaran,
            ],
        ]);
    }

    public function transkrip(Request $request)
    {
        $user = JWTAuth::user();
        $mahasiswa = Mahasiswa::where('user_id', $user->id)
            ->with(['prodi', 'kelas'])
            ->first();

        if (!$mahasiswa) {
            return redirect('/login')->with('error', 'Data mahasiswa tidak ditemukan');
        }

        // Filter
        $semester = $request->semester;
        $tahunAjaran = $request->tahun_ajaran;

        // Get semua nilai mahasiswa
        $query = Nilai::where('mahasiswa_id', $mahasiswa->id)
            ->with(['mataKuliah']);

        if ($semester) {
            $query->where('semester', $semester);
        }

        if ($tahunAjaran) {
            $query->where('tahun_ajaran', $tahunAjaran);
        }

        $nilaiList = $query->orderBy('tahun_ajaran', 'desc')
            ->orderBy('semester', 'desc')
            ->get();

        // Group by semester & tahun ajaran
        $transkrip = $nilaiList->groupBy(function($item) {
            return $item->tahun_ajaran . ' - ' . $item->semester;
        })->map(function($items, $key) {
            $totalSks = 0;
            $totalNilai = 0;

            $nilaiItems = $items->map(function($item) use (&$totalSks, &$totalNilai) {
                $totalSks += $item->mataKuliah->sks;
                $totalNilai += ($item->nilai_akhir * $item->mataKuliah->sks);

                return [
                    'id' => $item->id,
                    'mata_kuliah' => [
                        'nama' => $item->mataKuliah->nama_mk,
                        'kode' => $item->mataKuliah->kode_mk,
                        'sks' => $item->mataKuliah->sks,
                    ],
                    'tugas' => $item->tugas,
                    'uts' => $item->uts,
                    'uas' => $item->uas,
                    'nilai_akhir' => $item->nilai_akhir,
                    'grade' => $item->grade,
                ];
            });

            $ips = $totalSks > 0 ? round($totalNilai / $totalSks, 2) : 0;

            return [
                'periode' => $key,
                'nilai' => $nilaiItems,
                'total_sks' => $totalSks,
                'ips' => $ips,
            ];
        })->values();

        // Hitung IPK (keseluruhan)
        $semuaNilai = Nilai::where('mahasiswa_id', $mahasiswa->id)->get();
        $totalSksKeseluruhan = 0;
        $totalNilaiKeseluruhan = 0;

        foreach ($semuaNilai as $n) {
            $mk = MataKuliah::find($n->mata_kuliah_id);
            if ($mk) {
                $totalSksKeseluruhan += $mk->sks;
                $totalNilaiKeseluruhan += ($n->nilai_akhir * $mk->sks);
            }
        }

        $ipk = $totalSksKeseluruhan > 0 ? round($totalNilaiKeseluruhan / $totalSksKeseluruhan, 2) : 0;

        // Get unique semester & tahun ajaran untuk filter
        $semesterList = Nilai::where('mahasiswa_id', $mahasiswa->id)
            ->distinct()
            ->pluck('semester')
            ->sort()
            ->values();

        $tahunAjaranList = Nilai::where('mahasiswa_id', $mahasiswa->id)
            ->distinct()
            ->pluck('tahun_ajaran')
            ->sort()
            ->values();

        return Inertia::render('Mahasiswa/Nilai/Transkrip', [
            'mahasiswa' => $mahasiswa,
            'transkrip' => $transkrip,
            'ipk' => $ipk,
            'total_sks_lulus' => $totalSksKeseluruhan,
            'semesterList' => $semesterList,
            'tahunAjaranList' => $tahunAjaranList,
            'filters' => [
                'semester' => $semester,
                'tahun_ajaran' => $tahunAjaran,
            ],
        ]);
    }
}
