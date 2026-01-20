<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Pengumuman extends Model
{
    protected $table = 'pengumuman';
    protected $fillable = ['judul', 'isi', 'target_role'];

    /**
     * Users who have read this announcement
     */
    public function readers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'pengumuman_reads')
            ->withTimestamps()
            ->withPivot('read_at');
    }

    /**
     * Check if user has read this announcement
     */
    public function isReadBy(User $user): bool
    {
        return $this->readers()->where('user_id', $user->id)->exists();
    }

    /**
     * Mark as read by user
     */
    public function markAsReadBy(User $user): void
    {
        if (!$this->isReadBy($user)) {
            $this->readers()->attach($user->id, ['read_at' => now()]);
        }
    }
}
