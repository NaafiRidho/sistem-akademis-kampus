# Admin Features - CRUD Mahasiswa & Dosen

## Fitur yang Telah Ditambahkan

### 1. CRUD Mahasiswa (Students)
- **Create**: Tambah data mahasiswa baru dengan user account
- **Read**: Lihat daftar mahasiswa dengan pagination dan search
- **Update**: Edit data mahasiswa
- **Delete**: Hapus data mahasiswa beserta user account
- **Import Excel**: Import bulk data mahasiswa dari file Excel/CSV
- **Filter**: Filter berdasarkan Program Studi
- **Search**: Cari berdasarkan NIM atau Nama

### 2. CRUD Dosen (Lecturers)
- **Create**: Tambah data dosen baru dengan user account
- **Read**: Lihat daftar dosen dengan pagination dan search
- **Update**: Edit data dosen
- **Delete**: Hapus data dosen beserta user account
- **Import Excel**: Import bulk data dosen dari file Excel/CSV
- **Search**: Cari berdasarkan NIDN, Nama, atau Email

### 3. Import Data Excel
Fitur import mendukung:
- Format file: .xlsx, .xls, .csv
- Template dapat didownload dari halaman masing-masing
- Validasi data otomatis
- Laporan error untuk baris yang gagal diimport
- Pembuatan user account otomatis untuk setiap data yang diimport

## Instalasi

### 1. Install PhpSpreadsheet Package
```bash
composer install
```

Package `phpoffice/phpspreadsheet` sudah ditambahkan ke composer.json.

### 2. Migrate Database (jika belum)
```bash
php artisan migrate
```

### 3. Build Frontend Assets
```bash
npm install
npm run build
# atau untuk development
npm run dev
```

## Struktur File yang Dibuat

### Controllers
- `app/Http/Controllers/Admin/MahasiswaController.php`
- `app/Http/Controllers/Admin/DosenController.php`

### Views (React/Inertia)
- `resources/js/Pages/Admin/Mahasiswa/Index.jsx`
- `resources/js/Pages/Admin/Mahasiswa/Create.jsx`
- `resources/js/Pages/Admin/Mahasiswa/Edit.jsx`
- `resources/js/Pages/Admin/Dosen/Index.jsx`
- `resources/js/Pages/Admin/Dosen/Create.jsx`
- `resources/js/Pages/Admin/Dosen/Edit.jsx`

### Routes
Routes sudah ditambahkan di `routes/web.php` dengan prefix `/admin` dan middleware `admin`.

## Cara Menggunakan

### Akses Menu Admin
1. Login sebagai admin
2. Navigasi ke Dashboard Admin
3. Pilih menu **Mahasiswa** atau **Dosen** dari sidebar

### Menambah Data Mahasiswa
1. Klik menu **Mahasiswa**
2. Klik tombol **Tambah Mahasiswa**
3. Isi form:
   - NIM (required, unique)
   - Nama Lengkap (required)
   - Program Studi (required)
   - Angkatan (required)
   - Jenis Kelamin (required)
   - Alamat (optional)
   - Email (required, unique)
   - Password (required, min 8 karakter)
4. Klik **Simpan**

### Menambah Data Dosen
1. Klik menu **Dosen**
2. Klik tombol **Tambah Dosen**
3. Isi form:
   - NIDN (required, unique)
   - Nama Lengkap (required)
   - Email Dosen (required, unique) - untuk keperluan akademik
   - Email Login (required, unique) - untuk login ke sistem
   - Password (required, min 8 karakter)
4. Klik **Simpan**

### Import Data dari Excel

#### Import Mahasiswa
1. Klik menu **Mahasiswa**
2. Klik tombol **Import Excel**
3. Download template Excel (jika belum punya)
4. Isi data sesuai format template:
   - **Kolom A**: NIM
   - **Kolom B**: Nama
   - **Kolom C**: Prodi ID
   - **Kolom D**: Angkatan
   - **Kolom E**: Jenis Kelamin (L/P)
   - **Kolom F**: Email
   - **Kolom G**: Password
   - **Kolom H**: Alamat
5. Upload file Excel
6. Klik **Import**

#### Import Dosen
1. Klik menu **Dosen**
2. Klik tombol **Import Excel**
3. Download template Excel (jika belum punya)
4. Isi data sesuai format template:
   - **Kolom A**: NIDN
   - **Kolom B**: Nama
   - **Kolom C**: Email Dosen
   - **Kolom D**: Email Login
   - **Kolom E**: Password
5. Upload file Excel
6. Klik **Import**

### Edit Data
1. Pada halaman Index, klik tombol **Edit** pada baris data yang ingin diubah
2. Ubah data yang diperlukan
3. Klik **Update**

### Hapus Data
1. Pada halaman Index, klik tombol **Hapus** pada baris data yang ingin dihapus
2. Konfirmasi penghapusan
3. Data akan dihapus termasuk user account terkait

### Search & Filter
- **Mahasiswa**: 
  - Search by NIM atau Nama
  - Filter by Program Studi
- **Dosen**: 
  - Search by NIDN, Nama, atau Email

## Catatan Penting

### Role IDs
Pastikan role IDs sesuai dengan database:
- Admin: `1`
- Dosen: `2`
- Mahasiswa: `3`

Jika berbeda, update di:
- `MahasiswaController.php` line 73 (`'role_id' => 3`)
- `DosenController.php` line 52 (`'role_id' => 2`)

### Validasi
- NIM dan NIDN harus unique
- Email harus unique (baik email dosen maupun email login)
- Password minimal 8 karakter
- Angkatan harus tahun valid (2000 - tahun depan)

### Import Excel
- File maksimal 2MB (dapat diubah di php.ini)
- Baris pertama adalah header, akan di-skip
- Baris kosong akan di-skip
- Jika ada error, akan ditampilkan di halaman setelah import
- Data yang berhasil tetap akan tersimpan meskipun ada beberapa baris yang error

### Database Transaction
Semua operasi CRUD menggunakan database transaction untuk memastikan data consistency, terutama saat membuat/menghapus data yang terkait dengan user account.

## URL Routes

### Mahasiswa
- `GET /admin/mahasiswa` - Index
- `GET /admin/mahasiswa/create` - Create Form
- `POST /admin/mahasiswa` - Store
- `GET /admin/mahasiswa/{id}/edit` - Edit Form
- `PUT /admin/mahasiswa/{id}` - Update
- `DELETE /admin/mahasiswa/{id}` - Delete
- `POST /admin/mahasiswa/import` - Import Excel
- `GET /admin/mahasiswa/template/download` - Download Template

### Dosen
- `GET /admin/dosen` - Index
- `GET /admin/dosen/create` - Create Form
- `POST /admin/dosen` - Store
- `GET /admin/dosen/{id}/edit` - Edit Form
- `PUT /admin/dosen/{id}` - Update
- `DELETE /admin/dosen/{id}` - Delete
- `POST /admin/dosen/import` - Import Excel
- `GET /admin/dosen/template/download` - Download Template

## Troubleshooting

### Error: "Class 'PhpOffice\PhpSpreadsheet\IOFactory' not found"
```bash
composer install
```

### Pagination tidak muncul
Pastikan data lebih dari 15 records

### Import gagal semua
1. Cek format file (harus .xlsx, .xls, atau .csv)
2. Cek struktur kolom sesuai template
3. Cek Prodi ID valid (untuk mahasiswa)
4. Cek tidak ada duplikasi NIM/NIDN atau Email

### Tidak bisa akses halaman admin
1. Pastikan sudah login sebagai admin
2. Cek role user di database
3. Cek middleware di `routes/web.php`

## Pengembangan Lebih Lanjut

Fitur yang dapat ditambahkan:
1. Export data ke Excel
2. Bulk delete
3. Import dengan validasi lebih detail (email format, phone number, dll)
4. Upload foto profil
5. Activity log untuk tracking perubahan data
6. Soft delete untuk recovery data
7. Advanced filter (angkatan, status, dll)
8. Print data/reports
