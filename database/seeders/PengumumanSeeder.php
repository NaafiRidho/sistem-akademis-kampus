<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Pengumuman;

class PengumumanSeeder extends Seeder
{
    public function run(): void
    {
        $pengumuman = [
            [
                'judul' => 'Pengumuman UTS Semester Ganjil 2024/2025',
                'isi' => 'Ujian Tengah Semester (UTS) akan dilaksanakan pada tanggal 10-15 November 2024. Harap mahasiswa mempersiapkan diri dengan baik.',
                'target_role' => 'mahasiswa',
            ],
            [
                'judul' => 'Rapat Dosen Semester Ganjil 2024/2025',
                'isi' => 'Rapat koordinasi dosen akan dilaksanakan pada Senin, 5 November 2024 pukul 09:00 WIB di Aula Utama.',
                'target_role' => 'dosen',
            ],
            [
                'judul' => 'Libur Nasional - Hari Kemerdekaan',
                'isi' => 'Dalam rangka memperingati Hari Kemerdekaan RI, kampus akan libur pada tanggal 17 Agustus 2024.',
                'target_role' => null,
            ],
            [
                'judul' => 'Pendaftaran KRS Semester Genap 2024/2025',
                'isi' => 'Pendaftaran KRS semester genap dibuka mulai tanggal 1-15 Januari 2025. Mahasiswa diharapkan segera melakukan registrasi.',
                'target_role' => 'mahasiswa',
            ],
            [
                'judul' => 'Workshop Pembelajaran Aktif untuk Dosen',
                'isi' => 'Workshop pembelajaran aktif akan diadakan pada tanggal 20 November 2024. Dosen diharapkan hadir.',
                'target_role' => 'dosen',
            ],
            [
                'judul' => 'Perpanjangan Waktu Pembayaran UKT',
                'isi' => 'Waktu pembayaran UKT diperpanjang hingga 30 November 2024 tanpa denda.',
                'target_role' => 'mahasiswa',
            ],
            [
                'judul' => 'Penutupan Semester Ganjil 2024/2025',
                'isi' => 'Semester ganjil akan ditutup pada tanggal 31 Desember 2024. Semua nilai harus sudah diserahkan paling lambat 28 Desember 2024.',
                'target_role' => 'dosen',
            ],
            [
                'judul' => 'Penerimaan Mahasiswa Baru Tahun 2025',
                'isi' => 'Pendaftaran mahasiswa baru tahun akademik 2025/2026 dibuka mulai Februari 2025. Info lengkap di website resmi.',
                'target_role' => null,
            ],
        ];
        
        foreach ($pengumuman as $item) {
            Pengumuman::create($item);
        }
        
        $this->command->info("✓ Berhasil membuat " . count($pengumuman) . " pengumuman");
    }
}
