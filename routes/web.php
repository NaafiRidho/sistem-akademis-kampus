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
});

// Dosen Routes
Route::middleware(['dosen'])->prefix('dosen')->name('dosen.')->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\Dosen\DashboardController::class, 'index'])->name('dashboard');
});
