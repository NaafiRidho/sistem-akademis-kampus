<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use App\Models\Jadwal;
use App\Models\Kelas;
use App\Models\Dosen;
use App\Models\Mahasiswa;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Tymon\JWTAuth\Facades\JWTAuth;

class KelasController extends Controller
{
    public function index(Request $request)
    {
        $user = JWTAuth::user();
        $dosen = Dosen::where('user_id', $user->id)->first();

        if (!$dosen) {
            return redirect('/login')->with('error', 'Data dosen tidak ditemukan');
        }

        // Get kelas yang diampu berdasarkan jadwal
        $kelasIds = Jadwal::where('dosen_id', $dosen->id)
            ->distinct()
            ->pluck('kelas_id');

        $query = Kelas::whereIn('id', $kelasIds)
            ->with(['prodi.fakultas']);

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nama_kelas', 'like', "%{$search}%")
                  ->orWhere('tahun_ajaran', 'like', "%{$search}%");
            });
        }

        // Filter by prodi
        if ($request->has('prodi_id') && $request->prodi_id) {
            $query->where('prodi_id', $request->prodi_id);
        }

        $kelas = $query->get();

        // Tambahkan informasi mata kuliah dan jumlah mahasiswa per kelas
        $kelas = $kelas->map(function($item) use ($dosen) {
            // Get mata kuliah yang diajar di kelas ini
            $mataKuliah = Jadwal::where('dosen_id', $dosen->id)
                ->where('kelas_id', $item->id)
                ->with('mataKuliah')
                ->get()
                ->pluck('mataKuliah')
                ->unique('id')
                ->map(function($mk) {
                    return [
                        'id' => $mk->id,
                        'nama' => $mk->nama_mk,
                        'kode' => $mk->kode_mk,
                        'sks' => $mk->sks,
                    ];
                })
                ->values();

            // Hitung jumlah mahasiswa
            $jumlahMahasiswa = Mahasiswa::where('kelas_id', $item->id)->count();

            $item->mata_kuliah = $mataKuliah;
            $item->jumlah_mahasiswa = $jumlahMahasiswa;
            
            return $item;
        });

        return Inertia::render('Dosen/Kelas/Index', [
            'kelas' => $kelas,
            'dosen' => $dosen,
            'filters' => [
                'search' => $request->search,
                'prodi_id' => $request->prodi_id,
            ],
        ]);
    }

    public function mahasiswa($id)
    {
        $user = JWTAuth::user();
        $dosen = Dosen::where('user_id', $user->id)->first();

        if (!$dosen) {
            return redirect('/login')->with('error', 'Data dosen tidak ditemukan');
        }

        // Verifikasi bahwa dosen mengajar di kelas ini
        $isTeaching = Jadwal::where('dosen_id', $dosen->id)
            ->where('kelas_id', $id)
            ->exists();

        if (!$isTeaching) {
            return redirect()->route('dosen.kelas.index')
                ->with('error', 'Anda tidak mengajar di kelas ini');
        }

        // Get kelas info
        $kelas = Kelas::with(['prodi.fakultas'])->findOrFail($id);

        // Get mata kuliah yang diajar dosen di kelas ini
        $mataKuliah = Jadwal::where('dosen_id', $dosen->id)
            ->where('kelas_id', $id)
            ->with('mataKuliah')
            ->get()
            ->pluck('mataKuliah')
            ->unique('id')
            ->map(function($mk) {
                return [
                    'id' => $mk->id,
                    'nama' => $mk->nama_mk,
                    'kode' => $mk->kode_mk,
                    'sks' => $mk->sks,
                ];
            })
            ->values();

        // Get mahasiswa di kelas ini
        $mahasiswa = Mahasiswa::where('kelas_id', $id)
            ->with(['user', 'prodi'])
            ->orderBy('nim')
            ->get();

        // Tambahkan statistik absensi dan nilai per mahasiswa
        $mahasiswa = $mahasiswa->map(function($mhs) use ($mataKuliah) {
            // Hitung statistik absensi
            $totalAbsensi = $mhs->absensi()->count();
            $hadirCount = $mhs->absensi()->where('status', 'Hadir')->count();
            $persentaseKehadiran = $totalAbsensi > 0 
                ? round(($hadirCount / $totalAbsensi) * 100, 1) 
                : 0;

            $mhs->statistik_absensi = [
                'total' => $totalAbsensi,
                'hadir' => $hadirCount,
                'persentase' => $persentaseKehadiran,
            ];

            // Hitung rata-rata nilai dari mata kuliah yang diajar
            $mataKuliahIds = collect($mataKuliah)->pluck('id');
            $nilaiRataRata = $mhs->nilai()
                ->whereIn('mata_kuliah_id', $mataKuliahIds)
                ->whereNotNull('nilai_akhir')
                ->avg('nilai_akhir');

            $mhs->rata_rata_nilai = $nilaiRataRata ? round($nilaiRataRata, 2) : null;

            return $mhs;
        });

        return Inertia::render('Dosen/Kelas/Mahasiswa', [
            'kelas' => [
                'id' => $kelas->id,
                'nama_kelas' => $kelas->nama_kelas,
                'tahun_ajaran' => $kelas->tahun_ajaran,
                'semester' => $kelas->semester,
                'prodi' => [
                    'id' => $kelas->prodi->id,
                    'nama' => $kelas->prodi->nama,
                    'fakultas' => [
                        'id' => $kelas->prodi->fakultas->id,
                        'nama' => $kelas->prodi->fakultas->nama,
                    ],
                ],
            ],
            'mahasiswa' => $mahasiswa,
            'mata_kuliah' => $mataKuliah,
            'dosen' => [
                'id' => $dosen->id,
                'nama' => $dosen->nama,
                'nidn' => $dosen->nidn,
            ],
        ]);
    }
}
