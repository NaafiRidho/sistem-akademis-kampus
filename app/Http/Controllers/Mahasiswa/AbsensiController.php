<?php

namespace App\Http\Controllers\Mahasiswa;

use App\Http\Controllers\Controller;
use App\Models\Absensi;
use App\Models\Mahasiswa;
use App\Models\Jadwal;
use App\Models\MataKuliah;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Tymon\JWTAuth\Facades\JWTAuth;

class AbsensiController extends Controller
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

        // Get jadwal mahasiswa (berdasarkan kelas)
        $jadwalIds = Jadwal::where('kelas_id', $mahasiswa->kelas_id)->pluck('id');

        // Query absensi
        $query = Absensi::where('mahasiswa_id', $mahasiswa->id)
            ->with(['jadwal.mataKuliah', 'jadwal.dosen', 'jadwal.kelas']);

        // Filter by mata kuliah
        if ($request->filled('mata_kuliah_id')) {
            $query->whereHas('jadwal', function($q) use ($request) {
                $q->where('mata_kuliah_id', $request->mata_kuliah_id);
            });
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by bulan
        if ($request->filled('bulan')) {
            $bulan = $request->bulan;
            $query->whereYear('tanggal', substr($bulan, 0, 4))
                  ->whereMonth('tanggal', substr($bulan, 5, 2));
        }

        $absensi = $query->orderBy('tanggal', 'desc')->paginate(15);

        // Transform data
        $absensi->getCollection()->transform(function($item) {
            return [
                'id' => $item->id,
                'tanggal' => $item->tanggal->format('Y-m-d'),
                'hari' => $item->tanggal->locale('id')->dayName,
                'status' => $item->status,
                'keterangan' => $item->keterangan,
                'mata_kuliah' => [
                    'id' => $item->jadwal->mataKuliah->id,
                    'nama' => $item->jadwal->mataKuliah->nama_mk,
                    'kode' => $item->jadwal->mataKuliah->kode_mk,
                ],
                'dosen' => [
                    'id' => $item->jadwal->dosen->id,
                    'nama' => $item->jadwal->dosen->nama,
                ],
                'jadwal' => [
                    'jam_mulai' => date('H:i', strtotime($item->jadwal->jam_mulai)),
                    'jam_selesai' => date('H:i', strtotime($item->jadwal->jam_selesai)),
                ],
            ];
        });

        // Get mata kuliah list untuk filter
        $mataKuliahList = Jadwal::where('kelas_id', $mahasiswa->kelas_id)
            ->with('mataKuliah')
            ->get()
            ->pluck('mataKuliah')
            ->unique('id')
            ->values();

        // Statistik absensi
        $totalAbsensi = Absensi::where('mahasiswa_id', $mahasiswa->id)->count();
        $hadir = Absensi::where('mahasiswa_id', $mahasiswa->id)->where('status', 'Hadir')->count();
        $sakit = Absensi::where('mahasiswa_id', $mahasiswa->id)->where('status', 'Sakit')->count();
        $izin = Absensi::where('mahasiswa_id', $mahasiswa->id)->where('status', 'Izin')->count();
        $alpha = Absensi::where('mahasiswa_id', $mahasiswa->id)->where('status', 'Alpa')->count();
        
        $persentaseKehadiran = $totalAbsensi > 0 ? round(($hadir / $totalAbsensi) * 100, 2) : 0;

        $stats = [
            'total' => $totalAbsensi,
            'hadir' => $hadir,
            'sakit' => $sakit,
            'izin' => $izin,
            'alpha' => $alpha,
            'persentase_kehadiran' => $persentaseKehadiran,
        ];

        return Inertia::render('Mahasiswa/Absensi/Index', [
            'mahasiswa' => $mahasiswa,
            'absensi' => $absensi,
            'mataKuliahList' => $mataKuliahList,
            'stats' => $stats,
            'filters' => [
                'mata_kuliah_id' => $request->mata_kuliah_id,
                'status' => $request->status,
                'bulan' => $request->bulan ?? now()->format('Y-m'),
            ],
        ]);
    }

    public function rekap(Request $request)
    {
        $user = JWTAuth::user();
        $mahasiswa = Mahasiswa::where('user_id', $user->id)
            ->with(['prodi', 'kelas'])
            ->first();

        if (!$mahasiswa) {
            return redirect('/login')->with('error', 'Data mahasiswa tidak ditemukan');
        }

        // Get mata kuliah
        $mataKuliahList = Jadwal::where('kelas_id', $mahasiswa->kelas_id)
            ->with('mataKuliah')
            ->get()
            ->pluck('mataKuliah')
            ->unique('id')
            ->values();

        // Filter
        $bulan = $request->bulan ?? now()->format('Y-m');

        // Rekap per mata kuliah
        $rekapPerMataKuliah = $mataKuliahList->map(function($mk) use ($mahasiswa, $bulan) {
            // Get jadwal untuk mata kuliah ini
            $jadwalIds = Jadwal::where('kelas_id', $mahasiswa->kelas_id)
                ->where('mata_kuliah_id', $mk->id)
                ->pluck('id');

            // Count absensi
            $totalAbsensi = Absensi::where('mahasiswa_id', $mahasiswa->id)
                ->whereIn('jadwal_id', $jadwalIds)
                ->whereYear('tanggal', substr($bulan, 0, 4))
                ->whereMonth('tanggal', substr($bulan, 5, 2))
                ->count();

            $hadir = Absensi::where('mahasiswa_id', $mahasiswa->id)
                ->whereIn('jadwal_id', $jadwalIds)
                ->where('status', 'Hadir')
                ->whereYear('tanggal', substr($bulan, 0, 4))
                ->whereMonth('tanggal', substr($bulan, 5, 2))
                ->count();

            $sakit = Absensi::where('mahasiswa_id', $mahasiswa->id)
                ->whereIn('jadwal_id', $jadwalIds)
                ->where('status', 'Sakit')
                ->whereYear('tanggal', substr($bulan, 0, 4))
                ->whereMonth('tanggal', substr($bulan, 5, 2))
                ->count();

            $izin = Absensi::where('mahasiswa_id', $mahasiswa->id)
                ->whereIn('jadwal_id', $jadwalIds)
                ->where('status', 'Izin')
                ->whereYear('tanggal', substr($bulan, 0, 4))
                ->whereMonth('tanggal', substr($bulan, 5, 2))
                ->count();

            $alpa = Absensi::where('mahasiswa_id', $mahasiswa->id)
                ->whereIn('jadwal_id', $jadwalIds)
                ->where('status', 'Alpa')
                ->whereYear('tanggal', substr($bulan, 0, 4))
                ->whereMonth('tanggal', substr($bulan, 5, 2))
                ->count();

            $persentase = $totalAbsensi > 0 ? round(($hadir / $totalAbsensi) * 100, 2) : 0;

            return [
                'mata_kuliah' => [
                    'id' => $mk->id,
                    'nama' => $mk->nama_mk,
                    'kode' => $mk->kode_mk,
                ],
                'total' => $totalAbsensi,
                'hadir' => $hadir,
                'sakit' => $sakit,
                'izin' => $izin,
                'alpa' => $alpa,
                'persentase' => $persentase,
            ];
        });

        return Inertia::render('Mahasiswa/Absensi/Rekap', [
            'mahasiswa' => $mahasiswa,
            'rekapPerMataKuliah' => $rekapPerMataKuliah,
            'filters' => [
                'bulan' => $bulan,
            ],
        ]);
    }
}
