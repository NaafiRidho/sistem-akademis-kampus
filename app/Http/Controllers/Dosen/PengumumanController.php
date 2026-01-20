<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use App\Models\Pengumuman;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Tymon\JWTAuth\Facades\JWTAuth;

class PengumumanController extends Controller
{
    /**
     * Display a listing of pengumuman for dosen
     */
    public function index(Request $request)
    {
        $user = JWTAuth::user();
        
        $query = Pengumuman::query()
            ->whereIn('target_role', ['Dosen', 'Semua']);

        // Search
        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('judul', 'like', "%{$search}%")
                  ->orWhere('isi', 'like', "%{$search}%");
            });
        }

        // Filter: unread only
        if ($request->has('unread') && $request->unread == 'true') {
            $query->whereDoesntHave('readers', function($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        }

        $pengumuman = $query->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        // Add isRead flag to each announcement
        $pengumuman->getCollection()->transform(function ($item) use ($user) {
            $item->isRead = $item->isReadBy($user);
            return $item;
        });

        // Count unread announcements
        $unreadCount = Pengumuman::whereIn('target_role', ['Dosen', 'Semua'])
            ->whereDoesntHave('readers', function($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->count();

        return Inertia::render('Dosen/Pengumuman/Index', [
            'pengumuman' => $pengumuman,
            'unreadCount' => $unreadCount,
            'filters' => [
                'search' => $request->search ?? '',
                'unread' => $request->unread ?? '',
            ]
        ]);
    }

    /**
     * Display the specified pengumuman and mark as read
     */
    public function show(string $id)
    {
        $user = JWTAuth::user();
        $pengumuman = Pengumuman::findOrFail($id);

        // Mark as read
        $pengumuman->markAsReadBy($user);

        return Inertia::render('Dosen/Pengumuman/Show', [
            'pengumuman' => $pengumuman
        ]);
    }

    /**
     * Mark announcement as read
     */
    public function markAsRead(string $id)
    {
        $user = JWTAuth::user();
        $pengumuman = Pengumuman::findOrFail($id);
        
        $pengumuman->markAsReadBy($user);

        return response()->json([
            'success' => true,
            'message' => 'Pengumuman ditandai sudah dibaca'
        ]);
    }
}
