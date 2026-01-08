<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use App\Models\Jadwal;
use App\Models\Dosen;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Tymon\JWTAuth\Facades\JWTAuth;
use Carbon\Carbon;

class JadwalController extends Controller
{
    public function index(Request $request)
    {
        $user = JWTAuth::user();
        $dosen = Dosen::where('user_id', $user->id)->first();

        if (!$dosen) {
            return redirect('/login')->with('error', 'Data dosen tidak ditemukan');
        }

        $query = Jadwal::where('dosen_id', $dosen->id)
            ->with(['mataKuliah', 'kelas']);

        // Filter berdasarkan periode (hari/minggu/bulan)
        $filter = $request->input('filter', 'minggu');
        $tanggal = $request->input('tanggal', now()->format('Y-m-d'));
        $currentDate = Carbon::parse($tanggal);

        switch ($filter) {
            case 'hari':
                // Filter hari ini berdasarkan nama hari
                $namaHari = $currentDate->locale('id')->dayName;
                $query->where('hari', $namaHari);
                break;

            case 'minggu':
                // Filter minggu ini berdasarkan range tanggal
                $startOfWeek = $currentDate->copy()->startOfWeek();
                $endOfWeek = $currentDate->copy()->endOfWeek();
                
                // Karena jadwal menggunakan nama hari, kita ambil semua jadwal
                // dan filter di collection
                break;

            case 'bulan':
                // Filter bulan ini - tampilkan semua jadwal
                break;
        }

        $jadwal = $query->orderBy('hari')
            ->orderBy('jam_mulai')
            ->get();

        // Mapping hari ke angka untuk sorting
        $hariOrder = [
            'Senin' => 1,
            'Selasa' => 2,
            'Rabu' => 3,
            'Kamis' => 4,
            'Jumat' => 5,
            'Sabtu' => 6,
            'Minggu' => 7,
        ];

        // Sort jadwal berdasarkan hari
        $jadwal = $jadwal->sortBy(function($item) use ($hariOrder) {
            return $hariOrder[$item->hari] ?? 999;
        })->values();

        // Group jadwal by hari untuk tampilan yang lebih baik
        $jadwalGrouped = $jadwal->groupBy('hari');

        // Transform data untuk frontend
        $jadwalTransformed = $jadwal->map(function($item) {
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

        $jadwalGroupedTransformed = $jadwalTransformed->groupBy('hari');

        // Get statistik
        $totalMataKuliah = $jadwal->unique('mata_kuliah_id')->count();
        $totalKelas = $jadwal->unique('kelas_id')->count();
        
        // Hitung total jam mengajar per minggu
        $totalJamMinggu = $jadwal->sum(function($item) {
            $start = Carbon::parse($item->jam_mulai);
            $end = Carbon::parse($item->jam_selesai);
            // Gunakan diffInMinutes lalu konversi ke jam dengan pembulatan 1 desimal
            return round($start->diffInMinutes($end) / 60, 1);
        });

        return Inertia::render('Dosen/Jadwal/Index', [
            'jadwal' => $jadwalGroupedTransformed,
            'jadwalFlat' => $jadwalTransformed,
            'filter' => $filter,
            'tanggal' => $tanggal,
            'stats' => [
                'total_mata_kuliah' => $totalMataKuliah,
                'total_kelas' => $totalKelas,
                'total_jam_minggu' => $totalJamMinggu,
            ],
            'dosen' => $dosen,
        ]);
    }
}
