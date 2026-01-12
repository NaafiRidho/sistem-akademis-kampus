<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PengumpulanTugas extends Model
{
    protected $table = 'pengumpulan_tugas';
    protected $fillable = ['tugas_id', 'mahasiswa_id', 'file_path', 'waktu_pengumpulan', 'nilai', 'catatan'];

    protected $casts = [
        'nilai' => 'decimal:2',
        'waktu_pengumpulan' => 'datetime',
    ];

    public function tugas(): BelongsTo
    {
        return $this->belongsTo(Tugas::class);
    }

    public function mahasiswa(): BelongsTo
    {
        return $this->belongsTo(Mahasiswa::class);
    }
}
