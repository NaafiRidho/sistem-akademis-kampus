<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Nilai extends Model
{
    protected $table = 'nilai';
    protected $fillable = ['mahasiswa_id', 'mata_kuliah_id', 'tugas', 'uts', 'uas', 'nilai_akhir', 'grade'];

    protected $casts = [
        'tugas' => 'decimal:2',
        'uts' => 'decimal:2',
        'uas' => 'decimal:2',
        'nilai_akhir' => 'decimal:2',
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
