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
});
