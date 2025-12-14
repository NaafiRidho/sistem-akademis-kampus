<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Fakultas extends Model
{
    protected $table = 'fakultas';
    protected $fillable = ['nama_fakultas'];

    public function prodi(): HasMany
    {
        return $this->hasMany(Prodi::class);
    }
}
