# Quick Start Guide - Setup CRUD Admin

Ikuti langkah-langkah berikut untuk menjalankan fitur CRUD Mahasiswa dan Dosen:

## 1. Install Dependencies

```bash
# Install PHP dependencies (termasuk PhpSpreadsheet untuk import Excel)
composer install

# Install JavaScript dependencies
npm install
```

## 2. Build Frontend

```bash
# Untuk development (dengan hot reload)
npm run dev

# Atau untuk production
npm run build
```

## 3. Akses Aplikasi

1. Pastikan server Laravel berjalan:
   ```bash
   php artisan serve
   ```

2. Login sebagai Admin di: `http://localhost:8000/login`

3. Setelah login, akses Dashboard Admin di: `http://localhost:8000/admin/dashboard`

## 4. Menu yang Tersedia

Dari Dashboard Admin, Anda dapat mengakses:

- **Data Mahasiswa**: `/admin/mahasiswa`
  - Tambah, Edit, Hapus mahasiswa
  - Import data dari Excel
  - Search dan Filter
  
- **Data Dosen**: `/admin/dosen`
  - Tambah, Edit, Hapus dosen
  - Import data dari Excel
  - Search

## 5. Download Template Import

Pada halaman Mahasiswa atau Dosen:
1. Klik tombol **Import Excel**
2. Klik **Download Template Excel**
3. Isi template sesuai format
4. Upload kembali untuk import

## Format Template

### Template Mahasiswa (CSV):
```
NIM,Nama,Prodi ID,Angkatan,Jenis Kelamin (L/P),Email,Password,Alamat
2024001,John Doe,1,2024,L,john@student.ac.id,12345678,Jl. Example No. 1
```

### Template Dosen (CSV):
```
NIDN,Nama,Email Dosen,Email Login,Password
0012345678,Dr. John Doe,john.doe@university.ac.id,john@lecturer.ac.id,12345678
```

## Troubleshooting

### Jika PhpSpreadsheet belum terinstall:
```bash
composer require phpoffice/phpspreadsheet
```

### Jika ada error di frontend:
```bash
npm install
npm run build
```

### Jika tidak bisa akses halaman admin:
- Pastikan sudah login sebagai user dengan role Admin
- Cek di database tabel `users`, kolom `role_id` harus `1` (untuk admin)

## Selesai!

Fitur admin CRUD Mahasiswa dan Dosen sudah siap digunakan. 

Untuk dokumentasi lengkap, lihat file: `ADMIN_FEATURES.md`
