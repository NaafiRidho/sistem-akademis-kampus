<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Nilai extends Model
{
    protected $table = 'nilai';
    protected $fillable = [
        'mahasiswa_id',
        'mata_kuliah_id',
        'semester',
        'tahun_ajaran',
        'tugas',
        'uts',
        'uas',
        'nilai_akhir',
        'grade'
    ];

    protected $casts = [
        'tugas' => 'float',
        'uts' => 'float',
        'uas' => 'float',
        'nilai_akhir' => 'float',
    ];

    public function mahasiswa(): BelongsTo
    {
        return $this->belongsTo(Mahasiswa::class);
    }

    public function mataKuliah(): BelongsTo
    {
        return $this->belongsTo(MataKuliah::class);
    }
}
