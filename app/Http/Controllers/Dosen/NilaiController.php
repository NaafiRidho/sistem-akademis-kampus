<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use App\Models\Nilai;
use App\Models\Dosen;
use App\Models\Mahasiswa;
use App\Models\MataKuliah;
use App\Models\Jadwal;
use App\Models\Kelas;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\DB;

class NilaiController extends Controller
{
    public function index(Request $request)
    {
        $user = JWTAuth::user();
        $dosen = Dosen::where('user_id', $user->id)->first();

        if (!$dosen) {
            return redirect('/login')->with('error', 'Data dosen tidak ditemukan');
        }

        // Get mata kuliah yang diajar oleh dosen
        $mataKuliahIds = Jadwal::where('dosen_id', $dosen->id)
            ->distinct()
            ->pluck('mata_kuliah_id');

        // Query nilai
        $query = Nilai::whereIn('mata_kuliah_id', $mataKuliahIds)
            ->with(['mahasiswa.prodi', 'mahasiswa.kelas', 'mataKuliah']);

        // Filter by mata kuliah
        if ($request->filled('mata_kuliah_id')) {
            $query->where('mata_kuliah_id', $request->mata_kuliah_id);
        }

        // Filter by kelas
        if ($request->filled('kelas_id')) {
            $query->whereHas('mahasiswa', function($q) use ($request) {
                $q->where('kelas_id', $request->kelas_id);
            });
        }

        // Filter by semester & tahun ajaran
        if ($request->filled('semester')) {
            $query->where('semester', $request->semester);
        }

        if ($request->filled('tahun_ajaran')) {
            $query->where('tahun_ajaran', $request->tahun_ajaran);
        }

        // Search mahasiswa
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('mahasiswa', function($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('nim', 'like', "%{$search}%");
            });
        }

        $nilai = $query->orderBy('created_at', 'desc')->paginate(15);

        // Transform data
        $nilai->getCollection()->transform(function($item) {
            return [
                'id' => $item->id,
                'mahasiswa' => [
                    'id' => $item->mahasiswa->id,
                    'nim' => $item->mahasiswa->nim,
                    'nama' => $item->mahasiswa->nama,
                    'kelas' => $item->mahasiswa->kelas ? $item->mahasiswa->kelas->nama_kelas : 'Belum Ada Kelas',
                    'prodi' => $item->mahasiswa->prodi ? $item->mahasiswa->prodi->nama_prodi : 'Belum Ada Prodi',
                ],
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

        // Get mata kuliah list
        $mataKuliahList = MataKuliah::whereIn('id', $mataKuliahIds)->get();

        // Get kelas list yang diajar dosen
        $kelasIds = Jadwal::where('dosen_id', $dosen->id)
            ->distinct()
            ->pluck('kelas_id');
        $kelasList = Kelas::whereIn('id', $kelasIds)->with('prodi')->get();

        return Inertia::render('Dosen/Nilai/Index', [
            'dosen' => $dosen,
            'nilai' => $nilai,
            'mataKuliahList' => $mataKuliahList,
            'kelasList' => $kelasList,
            'filters' => [
                'mata_kuliah_id' => $request->mata_kuliah_id,
                'kelas_id' => $request->kelas_id,
                'semester' => $request->semester,
                'tahun_ajaran' => $request->tahun_ajaran,
                'search' => $request->search,
            ],
        ]);
    }

    public function create(Request $request)
    {
        $user = JWTAuth::user();
        $dosen = Dosen::where('user_id', $user->id)->first();

        if (!$dosen) {
            return redirect('/login')->with('error', 'Data dosen tidak ditemukan');
        }

        // Get mata kuliah yang diajar
        $mataKuliahIds = Jadwal::where('dosen_id', $dosen->id)
            ->distinct()
            ->pluck('mata_kuliah_id');
        $mataKuliahList = MataKuliah::whereIn('id', $mataKuliahIds)->get();

        // Get kelas yang diajar
        $kelasIds = Jadwal::where('dosen_id', $dosen->id)
            ->distinct()
            ->pluck('kelas_id');
        $kelasList = Kelas::whereIn('id', $kelasIds)->with('prodi')->get();

        return Inertia::render('Dosen/Nilai/Create', [
            'dosen' => $dosen,
            'mataKuliahList' => $mataKuliahList,
            'kelasList' => $kelasList,
        ]);
    }

    public function getMahasiswaByKelasAndMataKuliah(Request $request)
    {
        $kelasId = $request->kelas_id;
        $mataKuliahId = $request->mata_kuliah_id;
        $semester = $request->semester ?? 'Ganjil';
        $tahunAjaran = $request->tahun_ajaran ?? '2024/2025';

        $mahasiswa = Mahasiswa::where('kelas_id', $kelasId)
            ->orderBy('nim')
            ->get()
            ->map(function($mhs) use ($mataKuliahId, $semester, $tahunAjaran) {
                // Cek apakah sudah ada nilai
                $existingNilai = Nilai::where('mahasiswa_id', $mhs->id)
                    ->where('mata_kuliah_id', $mataKuliahId)
                    ->where('semester', $semester)
                    ->where('tahun_ajaran', $tahunAjaran)
                    ->first();

                return [
                    'id' => $mhs->id,
                    'nim' => $mhs->nim,
                    'nama' => $mhs->nama,
                    'tugas' => $existingNilai ? $existingNilai->tugas : null,
                    'uts' => $existingNilai ? $existingNilai->uts : null,
                    'uas' => $existingNilai ? $existingNilai->uas : null,
                    'nilai_akhir' => $existingNilai ? $existingNilai->nilai_akhir : null,
                    'grade' => $existingNilai ? $existingNilai->grade : null,
                    'nilai_id' => $existingNilai ? $existingNilai->id : null,
                ];
            });

        return response()->json([
            'mahasiswa' => $mahasiswa,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'mata_kuliah_id' => 'required|exists:mata_kuliah,id',
            'semester' => 'required|string',
            'tahun_ajaran' => 'required|string',
            'nilai' => 'required|array',
            'nilai.*.mahasiswa_id' => 'required|exists:mahasiswa,id',
            'nilai.*.tugas' => 'nullable|numeric|min:0|max:100',
            'nilai.*.uts' => 'nullable|numeric|min:0|max:100',
            'nilai.*.uas' => 'nullable|numeric|min:0|max:100',
        ]);

        try {
            DB::beginTransaction();

            foreach ($request->nilai as $data) {
                // Hitung nilai akhir (30% Tugas + 30% UTS + 40% UAS)
                $tugas = $data['tugas'] ?? 0;
                $uts = $data['uts'] ?? 0;
                $uas = $data['uas'] ?? 0;
                
                $nilaiAkhir = ($tugas * 0.3) + ($uts * 0.3) + ($uas * 0.4);
                
                // Tentukan grade
                $grade = $this->calculateGrade($nilaiAkhir);

                // Cek apakah sudah ada nilai
                $existing = Nilai::where('mahasiswa_id', $data['mahasiswa_id'])
                    ->where('mata_kuliah_id', $request->mata_kuliah_id)
                    ->where('semester', $request->semester)
                    ->where('tahun_ajaran', $request->tahun_ajaran)
                    ->first();

                if ($existing) {
                    // Update
                    $existing->update([
                        'tugas' => $tugas,
                        'uts' => $uts,
                        'uas' => $uas,
                        'nilai_akhir' => $nilaiAkhir,
                        'grade' => $grade,
                    ]);
                } else {
                    // Create baru
                    Nilai::create([
                        'mahasiswa_id' => $data['mahasiswa_id'],
                        'mata_kuliah_id' => $request->mata_kuliah_id,
                        'semester' => $request->semester,
                        'tahun_ajaran' => $request->tahun_ajaran,
                        'tugas' => $tugas,
                        'uts' => $uts,
                        'uas' => $uas,
                        'nilai_akhir' => $nilaiAkhir,
                        'grade' => $grade,
                    ]);
                }
            }

            DB::commit();

            return redirect()->route('dosen.nilai.index')
                ->with('success', 'Nilai berhasil disimpan!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal menyimpan nilai: ' . $e->getMessage());
        }
    }

    public function edit($id)
    {
        $user = JWTAuth::user();
        $dosen = Dosen::where('user_id', $user->id)->first();

        if (!$dosen) {
            return redirect('/login')->with('error', 'Data dosen tidak ditemukan');
        }

        $nilai = Nilai::with(['mahasiswa.prodi', 'mahasiswa.kelas', 'mataKuliah'])
            ->findOrFail($id);

        // Verifikasi bahwa nilai ini untuk mata kuliah yang diajar dosen ini
        $isDosen = Jadwal::where('dosen_id', $dosen->id)
            ->where('mata_kuliah_id', $nilai->mata_kuliah_id)
            ->exists();

        if (!$isDosen) {
            return redirect()->route('dosen.nilai.index')
                ->with('error', 'Anda tidak memiliki akses untuk mengedit nilai ini');
        }

        return Inertia::render('Dosen/Nilai/Edit', [
            'dosen' => $dosen,
            'nilai' => [
                'id' => $nilai->id,
                'mahasiswa' => [
                    'id' => $nilai->mahasiswa->id,
                    'nim' => $nilai->mahasiswa->nim,
                    'nama' => $nilai->mahasiswa->nama,
                    'kelas' => $nilai->mahasiswa->kelas->nama_kelas,
                ],
                'mata_kuliah' => [
                    'id' => $nilai->mataKuliah->id,
                    'nama' => $nilai->mataKuliah->nama_mk,
                    'kode' => $nilai->mataKuliah->kode_mk,
                ],
                'semester' => $nilai->semester,
                'tahun_ajaran' => $nilai->tahun_ajaran,
                'tugas' => $nilai->tugas,
                'uts' => $nilai->uts,
                'uas' => $nilai->uas,
                'nilai_akhir' => $nilai->nilai_akhir,
                'grade' => $nilai->grade,
            ],
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'tugas' => 'nullable|numeric|min:0|max:100',
            'uts' => 'nullable|numeric|min:0|max:100',
            'uas' => 'nullable|numeric|min:0|max:100',
        ]);

        $nilai = Nilai::findOrFail($id);

        // Hitung nilai akhir & grade
        $tugas = $request->tugas ?? 0;
        $uts = $request->uts ?? 0;
        $uas = $request->uas ?? 0;
        
        $nilaiAkhir = ($tugas * 0.3) + ($uts * 0.3) + ($uas * 0.4);
        $grade = $this->calculateGrade($nilaiAkhir);

        $nilai->update([
            'tugas' => $tugas,
            'uts' => $uts,
            'uas' => $uas,
            'nilai_akhir' => $nilaiAkhir,
            'grade' => $grade,
        ]);

        return redirect()->route('dosen.nilai.index')
            ->with('success', 'Nilai berhasil diperbarui!');
    }

    public function destroy($id)
    {
        $user = JWTAuth::user();
        $dosen = Dosen::where('user_id', $user->id)->first();

        $nilai = Nilai::findOrFail($id);

        // Verifikasi akses
        $isDosen = Jadwal::where('dosen_id', $dosen->id)
            ->where('mata_kuliah_id', $nilai->mata_kuliah_id)
            ->exists();

        if (!$isDosen) {
            return back()->with('error', 'Anda tidak memiliki akses untuk menghapus nilai ini');
        }

        $nilai->delete();

        return redirect()->route('dosen.nilai.index')
            ->with('success', 'Nilai berhasil dihapus!');
    }

    public function rekap(Request $request)
    {
        $user = JWTAuth::user();
        $dosen = Dosen::where('user_id', $user->id)->first();

        if (!$dosen) {
            return redirect('/login')->with('error', 'Data dosen tidak ditemukan');
        }

        // Get mata kuliah yang diajar
        $mataKuliahIds = Jadwal::where('dosen_id', $dosen->id)
            ->distinct()
            ->pluck('mata_kuliah_id');

        // Filters
        $mataKuliahId = $request->mata_kuliah_id;
        $kelasId = $request->kelas_id;
        $semester = $request->semester ?? 'Ganjil';
        $tahunAjaran = $request->tahun_ajaran ?? '2024/2025';

        // Query mahasiswa
        $query = Mahasiswa::query();

        if ($kelasId) {
            $query->where('kelas_id', $kelasId);
        } else {
            // Ambil semua mahasiswa di kelas yang diajar dosen
            $kelasIdsList = Jadwal::where('dosen_id', $dosen->id)
                ->distinct()
                ->pluck('kelas_id');
            $query->whereIn('kelas_id', $kelasIdsList);
        }

        $mahasiswaList = $query->with(['prodi', 'kelas'])
            ->orderBy('nim')
            ->get()
            ->map(function($mhs) use ($mataKuliahId, $semester, $tahunAjaran, $mataKuliahIds) {
                if ($mataKuliahId) {
                    // Detail nilai untuk satu mata kuliah
                    $nilai = Nilai::where('mahasiswa_id', $mhs->id)
                        ->where('mata_kuliah_id', $mataKuliahId)
                        ->where('semester', $semester)
                        ->where('tahun_ajaran', $tahunAjaran)
                        ->first();

                    return [
                        'id' => $mhs->id,
                        'nim' => $mhs->nim,
                        'nama' => $mhs->nama,
                        'kelas' => $mhs->kelas->nama_kelas,
                        'tugas' => $nilai->tugas ?? null,
                        'uts' => $nilai->uts ?? null,
                        'uas' => $nilai->uas ?? null,
                        'nilai_akhir' => $nilai->nilai_akhir ?? null,
                        'grade' => $nilai->grade ?? null,
                        'nilai_id' => $nilai->id ?? null,
                    ];
                } else {
                    // Ringkasan semua nilai
                    $nilaiList = Nilai::where('mahasiswa_id', $mhs->id)
                        ->whereIn('mata_kuliah_id', $mataKuliahIds)
                        ->where('semester', $semester)
                        ->where('tahun_ajaran', $tahunAjaran)
                        ->get();

                    $totalNilai = $nilaiList->count();
                    
                    // Calculate averages
                    $tugasAvg = $totalNilai > 0 ? $nilaiList->avg('tugas') : 0;
                    $utsAvg = $totalNilai > 0 ? $nilaiList->avg('uts') : 0;
                    $uasAvg = $totalNilai > 0 ? $nilaiList->avg('uas') : 0;
                    $nilaiAkhirAvg = $totalNilai > 0 ? $nilaiList->avg('nilai_akhir') : 0;
                    
                    // Get most common grade
                    $grades = $nilaiList->pluck('grade')->toArray();
                    $gradeCount = array_count_values($grades);
                    arsort($gradeCount);
                    $gradeTerbanyak = !empty($gradeCount) ? array_key_first($gradeCount) : '-';

                    return [
                        'mahasiswa_id' => $mhs->id,
                        'nim' => $mhs->nim,
                        'nama' => $mhs->nama,
                        'kelas' => $mhs->kelas->nama_kelas ?? '-',
                        'tugas_avg' => round($tugasAvg, 2),
                        'uts_avg' => round($utsAvg, 2),
                        'uas_avg' => round($uasAvg, 2),
                        'nilai_akhir_avg' => round($nilaiAkhirAvg, 2),
                        'grade_terbanyak' => $gradeTerbanyak,
                        'jumlah_mk' => $totalNilai,
                    ];
                }
            });

        // Get mata kuliah & kelas list untuk filter
        $mataKuliahList = MataKuliah::whereIn('id', $mataKuliahIds)->get();

        $kelasIds = Jadwal::where('dosen_id', $dosen->id)
            ->distinct()
            ->pluck('kelas_id');
        $kelasList = Kelas::whereIn('id', $kelasIds)->with('prodi')->get();

        return Inertia::render('Dosen/Nilai/Rekap', [
            'dosen' => $dosen,
            'rekapNilai' => $mahasiswaList,
            'mataKuliahList' => $mataKuliahList,
            'kelasList' => $kelasList,
            'filters' => [
                'mata_kuliah_id' => $mataKuliahId,
                'kelas_id' => $kelasId,
                'semester' => $semester,
                'tahun_ajaran' => $tahunAjaran,
            ],
        ]);
    }

    private function calculateGrade($nilaiAkhir)
    {
        if ($nilaiAkhir >= 85) return 'A';
        if ($nilaiAkhir >= 70) return 'B';
        if ($nilaiAkhir >= 60) return 'C';
        if ($nilaiAkhir >= 50) return 'D';
        return 'E';
    }
}
