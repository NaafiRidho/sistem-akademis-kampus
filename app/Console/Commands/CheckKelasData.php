<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Kelas;
use App\Models\Prodi;

class CheckKelasData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'check:kelas';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check kelas data and relationships';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('=== Checking Kelas Data ===');
        $this->newLine();

        // Count total kelas
        $totalKelas = Kelas::count();
        $this->info("✓ Total Kelas: {$totalKelas}");

        // Count kelas with prodi
        $kelasWithProdi = Kelas::whereNotNull('prodi_id')->count();
        $this->info("✓ Kelas dengan Prodi: {$kelasWithProdi}");

        // Count kelas without prodi
        $kelasWithoutProdi = Kelas::whereNull('prodi_id')->count();
        if ($kelasWithoutProdi > 0) {
            $this->warn("⚠ Kelas tanpa Prodi: {$kelasWithoutProdi}");
        } else {
            $this->info("✓ Kelas tanpa Prodi: 0");
        }

        $this->newLine();

        // Check sample data
        $this->info('=== Sample Kelas Data ===');
        $sampleKelas = Kelas::with('prodi')->take(5)->get();
        
        if ($sampleKelas->isEmpty()) {
            $this->error('✗ No kelas data found!');
            return 1;
        }

        $headers = ['ID', 'Nama Kelas', 'Semester', 'Prodi ID', 'Nama Prodi'];
        $rows = [];

        foreach ($sampleKelas as $kelas) {
            $rows[] = [
                $kelas->id,
                $kelas->nama_kelas,
                $kelas->semester,
                $kelas->prodi_id,
                $kelas->prodi?->nama_prodi ?? 'NULL'
            ];
        }

        $this->table($headers, $rows);

        $this->newLine();

        // Check kelas by prodi
        $this->info('=== Kelas Count by Prodi ===');
        $prodis = Prodi::withCount('kelas')->get();
        
        $prodiHeaders = ['Prodi ID', 'Nama Prodi', 'Jumlah Kelas'];
        $prodiRows = [];

        foreach ($prodis as $prodi) {
            $prodiRows[] = [
                $prodi->id,
                $prodi->nama_prodi,
                $prodi->kelas_count
            ];
        }

        $this->table($prodiHeaders, $prodiRows);

        $this->newLine();

        // Check for broken relationships
        $this->info('=== Checking Relationships ===');
        $brokenKelas = Kelas::whereNotNull('prodi_id')
            ->whereDoesntHave('prodi')
            ->count();
        
        if ($brokenKelas > 0) {
            $this->error("✗ Found {$brokenKelas} kelas with invalid prodi_id!");
        } else {
            $this->info('✓ All kelas relationships are valid');
        }

        $this->newLine();
        $this->info('✓ Check completed!');

        return 0;
    }
}
