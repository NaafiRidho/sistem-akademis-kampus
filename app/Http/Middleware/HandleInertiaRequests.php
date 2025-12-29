<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\Log;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = null;
        
        // Try to get user from JWT token in session
        try {
            $token = session('jwt_token');
            if ($token) {
                JWTAuth::setToken($token);
                $user = JWTAuth::authenticate();
            }
        } catch (\Exception $e) {
            // Token invalid or expired
        }

        $flash = [
            'success' => $request->session()->get('success'),
            'error' => $request->session()->get('error'),
            'import_errors' => $request->session()->get('import_errors'),
        ];
        
        // Debug log
        if ($flash['success'] || $flash['error']) {
            Log::info('Flash messages in middleware:', $flash);
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role ? $user->role->name : null,
                ] : null,
            ],
            'flash' => $flash,
        ];
    }
}
