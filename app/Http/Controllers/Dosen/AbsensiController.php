<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use App\Models\Absensi;
use App\Models\Dosen;
use App\Models\Mahasiswa;
use App\Models\Jadwal;
use App\Models\MataKuliah;
use App\Models\Kelas;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AbsensiController extends Controller
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

        // Get kelas yang diajar oleh dosen
        $kelasIds = Jadwal::where('dosen_id', $dosen->id)
            ->distinct()
            ->pluck('kelas_id');

        // Query absensi
        $query = Absensi::whereHas('jadwal', function($q) use ($dosen) {
                $q->where('dosen_id', $dosen->id);
            })
            ->with(['mahasiswa.prodi', 'jadwal.mataKuliah', 'jadwal.kelas']);

        // Filter by mata kuliah
        if ($request->filled('mata_kuliah_id')) {
            $query->whereHas('jadwal', function($q) use ($request) {
                $q->where('mata_kuliah_id', $request->mata_kuliah_id);
            });
        }

        // Filter by kelas
        if ($request->filled('kelas_id')) {
            $query->whereHas('jadwal', function($q) use ($request) {
                $q->where('kelas_id', $request->kelas_id);
            });
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by tanggal
        if ($request->filled('tanggal')) {
            $query->whereDate('tanggal', $request->tanggal);
        }

        // Search mahasiswa
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('mahasiswa', function($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('nim', 'like', "%{$search}%");
            });
        }

        $absensi = $query->orderBy('tanggal', 'desc')->paginate(15);

        // Transform data
        $absensi->getCollection()->transform(function($item) {
            return [
                'id' => $item->id,
                'tanggal' => $item->tanggal->format('Y-m-d'),
                'status' => $item->status,
                'keterangan' => $item->keterangan,
                'mahasiswa' => [
                    'id' => $item->mahasiswa->id,
                    'nim' => $item->mahasiswa->nim,
                    'nama' => $item->mahasiswa->nama,
                    'prodi' => $item->mahasiswa->prodi->nama_prodi,
                ],
                'jadwal' => [
                    'id' => $item->jadwal->id,
                    'mata_kuliah' => [
                        'id' => $item->jadwal->mataKuliah->id,
                        'nama' => $item->jadwal->mataKuliah->nama_mk,
                        'kode' => $item->jadwal->mataKuliah->kode_mk,
                    ],
                    'kelas' => [
                        'id' => $item->jadwal->kelas->id,
                        'nama' => $item->jadwal->kelas->nama_kelas,
                    ],
                ],
            ];
        });

        // Get mata kuliah list
        $mataKuliahList = MataKuliah::whereIn('id', $mataKuliahIds)->get();

        // Get kelas list
        $kelasList = Kelas::whereIn('id', $kelasIds)->with('prodi')->get();

        return Inertia::render('Dosen/Absensi/Index', [
            'dosen' => $dosen,
            'absensi' => $absensi,
            'mataKuliahList' => $mataKuliahList,
            'kelasList' => $kelasList,
            'filters' => [
                'mata_kuliah_id' => $request->mata_kuliah_id,
                'kelas_id' => $request->kelas_id,
                'status' => $request->status,
                'tanggal' => $request->tanggal,
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

        // Get jadwal dosen
        $jadwalList = Jadwal::where('dosen_id', $dosen->id)
            ->with(['mataKuliah', 'kelas.prodi'])
            ->get()
            ->map(function($jadwal) {
                return [
                    'id' => $jadwal->id,
                    'mata_kuliah' => $jadwal->mataKuliah->nama_mk . ' (' . $jadwal->mataKuliah->kode_mk . ')',
                    'kelas' => $jadwal->kelas->nama_kelas,
                    'hari' => $jadwal->hari,
                ];
            });

        return Inertia::render('Dosen/Absensi/Create', [
            'dosen' => $dosen,
            'jadwalList' => $jadwalList,
        ]);
    }

    public function getMahasiswaByJadwal(Request $request)
    {
        $jadwalId = $request->jadwal_id;
        $tanggal = $request->tanggal ?? now()->format('Y-m-d');

        $jadwal = Jadwal::with(['kelas', 'mataKuliah'])->findOrFail($jadwalId);
        
        // Get mahasiswa di kelas ini
        $mahasiswa = Mahasiswa::where('kelas_id', $jadwal->kelas_id)
            ->orderBy('nim')
            ->get()
            ->map(function($mhs) use ($jadwalId, $tanggal) {
                // Cek apakah sudah ada absensi untuk tanggal ini
                $existingAbsensi = Absensi::where('jadwal_id', $jadwalId)
                    ->where('mahasiswa_id', $mhs->id)
                    ->whereDate('tanggal', $tanggal)
                    ->first();

                return [
                    'id' => $mhs->id,
                    'nim' => $mhs->nim,
                    'nama' => $mhs->nama,
                    'status' => $existingAbsensi ? $existingAbsensi->status : null,
                    'keterangan' => $existingAbsensi ? $existingAbsensi->keterangan : null,
                    'absensi_id' => $existingAbsensi ? $existingAbsensi->id : null,
                ];
            });

        return response()->json([
            'mahasiswa' => $mahasiswa,
            'jadwal' => $jadwal,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'jadwal_id' => 'required|exists:jadwal,id',
            'tanggal' => 'required|date',
            'absensi' => 'required|array',
            'absensi.*.mahasiswa_id' => 'required|exists:mahasiswa,id',
            'absensi.*.status' => 'required|in:Hadir,Izin,Sakit,Alpa',
            'absensi.*.keterangan' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            foreach ($request->absensi as $data) {
                // Cek apakah sudah ada absensi untuk mahasiswa ini di jadwal & tanggal yang sama
                $existing = Absensi::where('jadwal_id', $request->jadwal_id)
                    ->where('mahasiswa_id', $data['mahasiswa_id'])
                    ->whereDate('tanggal', $request->tanggal)
                    ->first();

                if ($existing) {
                    // Update jika sudah ada
                    $existing->update([
                        'status' => $data['status'],
                        'keterangan' => $data['keterangan'] ?? null,
                    ]);
                } else {
                    // Create baru
                    Absensi::create([
                        'jadwal_id' => $request->jadwal_id,
                        'mahasiswa_id' => $data['mahasiswa_id'],
                        'tanggal' => $request->tanggal,
                        'status' => $data['status'],
                        'keterangan' => $data['keterangan'] ?? null,
                    ]);
                }
            }

            DB::commit();

            return redirect()->route('dosen.absensi.index')
                ->with('success', 'Absensi berhasil disimpan!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal menyimpan absensi: ' . $e->getMessage());
        }
    }

    public function edit($id)
    {
        $user = JWTAuth::user();
        $dosen = Dosen::where('user_id', $user->id)->first();

        if (!$dosen) {
            return redirect('/login')->with('error', 'Data dosen tidak ditemukan');
        }

        $absensi = Absensi::with(['mahasiswa.prodi', 'jadwal.mataKuliah', 'jadwal.kelas'])
            ->findOrFail($id);

        // Verifikasi bahwa absensi ini untuk jadwal yang diajar dosen ini
        if ($absensi->jadwal->dosen_id != $dosen->id) {
            return redirect()->route('dosen.absensi.index')
                ->with('error', 'Anda tidak memiliki akses untuk mengedit absensi ini');
        }

        return Inertia::render('Dosen/Absensi/Edit', [
            'dosen' => $dosen,
            'absensi' => [
                'id' => $absensi->id,
                'tanggal' => $absensi->tanggal->format('Y-m-d'),
                'status' => $absensi->status,
                'keterangan' => $absensi->keterangan,
                'mahasiswa' => [
                    'id' => $absensi->mahasiswa->id,
                    'nim' => $absensi->mahasiswa->nim,
                    'nama' => $absensi->mahasiswa->nama,
                ],
                'jadwal' => [
                    'mata_kuliah' => $absensi->jadwal->mataKuliah->nama_mk,
                    'kelas' => $absensi->jadwal->kelas->nama_kelas,
                ],
            ],
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:Hadir,Izin,Sakit,Alpa',
            'keterangan' => 'nullable|string',
        ]);

        $absensi = Absensi::findOrFail($id);
        
        $absensi->update([
            'status' => $request->status,
            'keterangan' => $request->keterangan,
        ]);

        return redirect()->route('dosen.absensi.index')
            ->with('success', 'Absensi berhasil diperbarui!');
    }

    public function destroy($id)
    {
        $user = JWTAuth::user();
        $dosen = Dosen::where('user_id', $user->id)->first();

        $absensi = Absensi::findOrFail($id);

        // Verifikasi bahwa absensi ini untuk jadwal yang diajar dosen ini
        if ($absensi->jadwal->dosen_id != $dosen->id) {
            return back()->with('error', 'Anda tidak memiliki akses untuk menghapus absensi ini');
        }

        $absensi->delete();

        return redirect()->route('dosen.absensi.index')
            ->with('success', 'Absensi berhasil dihapus!');
    }

    public function rekap(Request $request)
    {
        $user = JWTAuth::user();
        $dosen = Dosen::where('user_id', $user->id)->first();

        if (!$dosen) {
            return redirect('/login')->with('error', 'Data dosen tidak ditemukan');
        }

        // Get jadwal yang diajar dosen
        $jadwalIds = Jadwal::where('dosen_id', $dosen->id)->pluck('id');

        // Filter
        $jadwalId = $request->jadwal_id;
        $kelasId = $request->kelas_id;
        $bulan = $request->bulan ?? now()->format('Y-m');

        // Base query
        $query = Mahasiswa::query();

        if ($kelasId) {
            $query->where('kelas_id', $kelasId);
        } else {
            // Jika tidak ada filter kelas, ambil semua mahasiswa di kelas yang diajar dosen
            $kelasIdsList = Jadwal::where('dosen_id', $dosen->id)
                ->distinct()
                ->pluck('kelas_id');
            $query->whereIn('kelas_id', $kelasIdsList);
        }

        $mahasiswaList = $query->with(['prodi', 'kelas'])
            ->orderBy('nim')
            ->get()
            ->map(function($mhs) use ($jadwalIds, $jadwalId, $bulan) {
                // Query absensi
                $absensiQuery = Absensi::where('mahasiswa_id', $mhs->id)
                    ->whereIn('jadwal_id', $jadwalIds)
                    ->whereYear('tanggal', substr($bulan, 0, 4))
                    ->whereMonth('tanggal', substr($bulan, 5, 2));

                if ($jadwalId) {
                    $absensiQuery->where('jadwal_id', $jadwalId);
                }

                $totalAbsensi = $absensiQuery->count();
                $hadir = $absensiQuery->where('status', 'Hadir')->count();
                $izin = $absensiQuery->where('status', 'Izin')->count();
                $sakit = $absensiQuery->where('status', 'Sakit')->count();
                $alpa = $absensiQuery->where('status', 'Alpa')->count();

                $persentase = $totalAbsensi > 0 ? round(($hadir / $totalAbsensi) * 100, 2) : 0;

                return [
                    'id' => $mhs->id,
                    'nim' => $mhs->nim,
                    'nama' => $mhs->nama,
                    'kelas' => $mhs->kelas->nama_kelas,
                    'prodi' => $mhs->prodi->nama_prodi,
                    'total' => $totalAbsensi,
                    'hadir' => $hadir,
                    'izin' => $izin,
                    'sakit' => $sakit,
                    'alpa' => $alpa,
                    'persentase' => $persentase,
                ];
            });

        // Get mata kuliah & kelas list untuk filter
        $mataKuliahList = MataKuliah::whereIn('id', Jadwal::where('dosen_id', $dosen->id)->pluck('mata_kuliah_id'))
            ->get();

        $kelasList = Kelas::whereIn('id', Jadwal::where('dosen_id', $dosen->id)->pluck('kelas_id'))
            ->with('prodi')
            ->get();

        $jadwalList = Jadwal::where('dosen_id', $dosen->id)
            ->with(['mataKuliah', 'kelas'])
            ->get()
            ->map(function($jadwal) {
                return [
                    'id' => $jadwal->id,
                    'label' => $jadwal->mataKuliah->nama_mk . ' - ' . $jadwal->kelas->nama_kelas,
                ];
            });

        return Inertia::render('Dosen/Absensi/Rekap', [
            'dosen' => $dosen,
            'mahasiswaList' => $mahasiswaList,
            'mataKuliahList' => $mataKuliahList,
            'kelasList' => $kelasList,
            'jadwalList' => $jadwalList,
            'filters' => [
                'jadwal_id' => $jadwalId,
                'kelas_id' => $kelasId,
                'bulan' => $bulan,
            ],
        ]);
    }
}
