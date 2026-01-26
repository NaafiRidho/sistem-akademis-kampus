<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Models\Fakultas;
use App\Models\Prodi;
use App\Models\Dosen;
use App\Models\Mahasiswa;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Admin\DashboardController;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'appName' => 'Sistem Manajemen Kampus',
        'stats' => [
            'fakultas' => Fakultas::count(),
            'prodi' => Prodi::count(),
            'dosen' => Dosen::count(),
            'mahasiswa' => Mahasiswa::count(),
        ]
    ]);
});

// Authentication Routes
Route::get('/login', [LoginController::class, 'showLoginForm'])->name('login');
Route::post('/login', [LoginController::class, 'login']);
Route::post('/logout', [LoginController::class, 'logout'])->name('logout');

// Admin Routes
Route::middleware(['admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // Mahasiswa CRUD
    Route::resource('mahasiswa', \App\Http\Controllers\Admin\MahasiswaController::class);
    Route::post('mahasiswa/import', [\App\Http\Controllers\Admin\MahasiswaController::class, 'import'])->name('mahasiswa.import');
    Route::get('mahasiswa/template/download', [\App\Http\Controllers\Admin\MahasiswaController::class, 'downloadTemplate'])->name('mahasiswa.template');
    
    // Dosen CRUD
    Route::resource('dosen', \App\Http\Controllers\Admin\DosenController::class);
    Route::post('dosen/import', [\App\Http\Controllers\Admin\DosenController::class, 'import'])->name('dosen.import');
    Route::get('dosen/template/download', [\App\Http\Controllers\Admin\DosenController::class, 'downloadTemplate'])->name('dosen.template');
    
    // Fakultas CRUD
    Route::resource('fakultas', \App\Http\Controllers\Admin\FakultasController::class);
    Route::post('fakultas/import', [\App\Http\Controllers\Admin\FakultasController::class, 'import'])->name('fakultas.import');
    Route::get('fakultas/template/download', [\App\Http\Controllers\Admin\FakultasController::class, 'downloadTemplate'])->name('fakultas.template');
    
    // Prodi CRUD
    Route::resource('prodi', \App\Http\Controllers\Admin\ProdiController::class);
    Route::post('prodi/import', [\App\Http\Controllers\Admin\ProdiController::class, 'import'])->name('prodi.import');
    Route::get('prodi/template/download', [\App\Http\Controllers\Admin\ProdiController::class, 'downloadTemplate'])->name('prodi.template');
    
    // Mata Kuliah CRUD
    Route::post('matakuliah/import', [\App\Http\Controllers\Admin\MataKuliahController::class, 'import'])->name('matakuliah.import');
    Route::get('matakuliah/template/download', [\App\Http\Controllers\Admin\MataKuliahController::class, 'downloadTemplate'])->name('matakuliah.template');
    Route::resource('matakuliah', \App\Http\Controllers\Admin\MataKuliahController::class);
    
    // Jadwal CRUD
    Route::post('jadwal/import', [\App\Http\Controllers\Admin\JadwalController::class, 'import'])->name('jadwal.import');
    Route::get('jadwal/template/download', [\App\Http\Controllers\Admin\JadwalController::class, 'downloadTemplate'])->name('jadwal.template');
    Route::resource('jadwal', \App\Http\Controllers\Admin\JadwalController::class);
    
    // Nilai CRUD
    Route::post('nilai/import', [\App\Http\Controllers\Admin\NilaiController::class, 'import'])->name('nilai.import');
    Route::get('nilai/template/download', [\App\Http\Controllers\Admin\NilaiController::class, 'downloadTemplate'])->name('nilai.template');
    Route::resource('nilai', \App\Http\Controllers\Admin\NilaiController::class);
    
    // Absensi CRUD
    Route::resource('absensi', \App\Http\Controllers\Admin\AbsensiController::class);
    Route::post('absensi/import', [\App\Http\Controllers\Admin\AbsensiController::class, 'import'])->name('absensi.import');
    Route::get('absensi/template/download', [\App\Http\Controllers\Admin\AbsensiController::class, 'downloadTemplate'])->name('absensi.template');
    Route::get('absensi/rekap/{mahasiswa}', [\App\Http\Controllers\Admin\AbsensiController::class, 'rekap'])->name('absensi.rekap');
    
    // Pengumuman CRUD
    Route::resource('pengumuman', \App\Http\Controllers\Admin\PengumumanController::class);
});

// Dosen Routes
Route::middleware(['dosen'])->prefix('dosen')->name('dosen.')->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\Dosen\DashboardController::class, 'index'])->name('dashboard');
    
    // Jadwal Mengajar
    Route::get('/jadwal', [\App\Http\Controllers\Dosen\JadwalController::class, 'index'])->name('jadwal.index');
    
    // Kelas yang Diampu
    Route::get('/kelas', [\App\Http\Controllers\Dosen\KelasController::class, 'index'])->name('kelas.index');
    Route::get('/kelas/{id}/mahasiswa', [\App\Http\Controllers\Dosen\KelasController::class, 'mahasiswa'])->name('kelas.mahasiswa');
    
    // Materi Pembelajaran
    Route::get('/materi', [\App\Http\Controllers\Dosen\MateriController::class, 'index'])->name('materi.index');
    Route::get('/materi/create', [\App\Http\Controllers\Dosen\MateriController::class, 'create'])->name('materi.create');
    Route::post('/materi', [\App\Http\Controllers\Dosen\MateriController::class, 'store'])->name('materi.store');
    Route::delete('/materi/{id}', [\App\Http\Controllers\Dosen\MateriController::class, 'destroy'])->name('materi.destroy');
    Route::get('/materi/{id}/download', [\App\Http\Controllers\Dosen\MateriController::class, 'download'])->name('materi.download');
    
    // Tugas
    Route::get('/tugas', [\App\Http\Controllers\Dosen\TugasController::class, 'index'])->name('tugas.index');
    Route::get('/tugas/create', [\App\Http\Controllers\Dosen\TugasController::class, 'create'])->name('tugas.create');
    Route::post('/tugas', [\App\Http\Controllers\Dosen\TugasController::class, 'store'])->name('tugas.store');
    Route::get('/tugas/{id}', [\App\Http\Controllers\Dosen\TugasController::class, 'show'])->name('tugas.show');
    Route::get('/tugas/{id}/edit', [\App\Http\Controllers\Dosen\TugasController::class, 'edit'])->name('tugas.edit');
    Route::put('/tugas/{id}', [\App\Http\Controllers\Dosen\TugasController::class, 'update'])->name('tugas.update');
    Route::delete('/tugas/{id}', [\App\Http\Controllers\Dosen\TugasController::class, 'destroy'])->name('tugas.destroy');
    Route::get('/tugas/{id}/download', [\App\Http\Controllers\Dosen\TugasController::class, 'download'])->name('tugas.download');
    Route::get('/tugas/pengumpulan/{id}/download', [\App\Http\Controllers\Dosen\TugasController::class, 'downloadPengumpulan'])->name('tugas.pengumpulan.download');
    Route::post('/tugas/pengumpulan/{id}/nilai', [\App\Http\Controllers\Dosen\TugasController::class, 'nilai'])->name('tugas.pengumpulan.nilai');
    
    // Pengumuman
    Route::get('/pengumuman', [\App\Http\Controllers\Dosen\PengumumanController::class, 'index'])->name('pengumuman.index');
    Route::get('/pengumuman/{id}', [\App\Http\Controllers\Dosen\PengumumanController::class, 'show'])->name('pengumuman.show');
    Route::post('/pengumuman/{id}/mark-read', [\App\Http\Controllers\Dosen\PengumumanController::class, 'markAsRead'])->name('pengumuman.markAsRead');
    
    // Absensi - Dosen can manage attendance for their classes
    Route::get('/absensi', [\App\Http\Controllers\Dosen\AbsensiController::class, 'index'])->name('absensi.index');
    Route::get('/absensi/create', [\App\Http\Controllers\Dosen\AbsensiController::class, 'create'])->name('absensi.create');
    Route::post('/absensi', [\App\Http\Controllers\Dosen\AbsensiController::class, 'store'])->name('absensi.store');
    Route::get('/absensi/get-mahasiswa', [\App\Http\Controllers\Dosen\AbsensiController::class, 'getMahasiswaByJadwal'])->name('absensi.getMahasiswa');
    Route::get('/absensi/rekap', [\App\Http\Controllers\Dosen\AbsensiController::class, 'rekap'])->name('absensi.rekap');
    Route::get('/absensi/{id}/edit', [\App\Http\Controllers\Dosen\AbsensiController::class, 'edit'])->name('absensi.edit');
    Route::put('/absensi/{id}', [\App\Http\Controllers\Dosen\AbsensiController::class, 'update'])->name('absensi.update');
    Route::delete('/absensi/{id}', [\App\Http\Controllers\Dosen\AbsensiController::class, 'destroy'])->name('absensi.destroy');
    
    // Nilai - Dosen can manage grades for their courses
    Route::get('/nilai', [\App\Http\Controllers\Dosen\NilaiController::class, 'index'])->name('nilai.index');
    Route::get('/nilai/create', [\App\Http\Controllers\Dosen\NilaiController::class, 'create'])->name('nilai.create');
    Route::post('/nilai', [\App\Http\Controllers\Dosen\NilaiController::class, 'store'])->name('nilai.store');
    Route::get('/nilai/get-mahasiswa', [\App\Http\Controllers\Dosen\NilaiController::class, 'getMahasiswaByKelasAndMataKuliah'])->name('nilai.getMahasiswa');
    Route::get('/nilai/rekap', [\App\Http\Controllers\Dosen\NilaiController::class, 'rekap'])->name('nilai.rekap');
    Route::get('/nilai/{id}/edit', [\App\Http\Controllers\Dosen\NilaiController::class, 'edit'])->name('nilai.edit');
    Route::put('/nilai/{id}', [\App\Http\Controllers\Dosen\NilaiController::class, 'update'])->name('nilai.update');
    Route::delete('/nilai/{id}', [\App\Http\Controllers\Dosen\NilaiController::class, 'destroy'])->name('nilai.destroy');
});

// Mahasiswa Routes
Route::middleware(['mahasiswa'])->prefix('mahasiswa')->name('mahasiswa.')->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\Mahasiswa\DashboardController::class, 'index'])->name('dashboard');
    
    // Jadwal Kuliah
    Route::get('/jadwal', [\App\Http\Controllers\Mahasiswa\JadwalController::class, 'index'])->name('jadwal.index');
    
    // Materi Pembelajaran
    Route::get('/materi', [\App\Http\Controllers\Mahasiswa\MateriController::class, 'index'])->name('materi.index');
    Route::get('/materi/{id}/download', [\App\Http\Controllers\Mahasiswa\MateriController::class, 'download'])->name('materi.download');
    
    // Tugas
    Route::get('/tugas', [\App\Http\Controllers\Mahasiswa\TugasController::class, 'index'])->name('tugas.index');
    Route::get('/tugas/{id}', [\App\Http\Controllers\Mahasiswa\TugasController::class, 'show'])->name('tugas.show');
    Route::post('/tugas/{id}/submit', [\App\Http\Controllers\Mahasiswa\TugasController::class, 'submit'])->name('tugas.submit');
    Route::get('/tugas/{id}/download', [\App\Http\Controllers\Mahasiswa\TugasController::class, 'download'])->name('tugas.download');
    Route::get('/tugas/pengumpulan/{id}/download', [\App\Http\Controllers\Mahasiswa\TugasController::class, 'downloadPengumpulan'])->name('tugas.pengumpulan.download');
    
    // Pengumuman
    Route::get('/pengumuman', [\App\Http\Controllers\Mahasiswa\PengumumanController::class, 'index'])->name('pengumuman.index');
    Route::get('/pengumuman/{id}', [\App\Http\Controllers\Mahasiswa\PengumumanController::class, 'show'])->name('pengumuman.show');
    Route::post('/pengumuman/{id}/mark-read', [\App\Http\Controllers\Mahasiswa\PengumumanController::class, 'markAsRead'])->name('pengumuman.markAsRead');
    
    // Absensi - Mahasiswa can view their attendance (read-only)
    Route::get('/absensi', [\App\Http\Controllers\Mahasiswa\AbsensiController::class, 'index'])->name('absensi.index');
    Route::get('/absensi/rekap', [\App\Http\Controllers\Mahasiswa\AbsensiController::class, 'rekap'])->name('absensi.rekap');
    
    // Nilai - Mahasiswa can view their grades (read-only)
    Route::get('/nilai', [\App\Http\Controllers\Mahasiswa\NilaiController::class, 'index'])->name('nilai.index');
    Route::get('/nilai/transkrip', [\App\Http\Controllers\Mahasiswa\NilaiController::class, 'transkrip'])->name('nilai.transkrip');
});
