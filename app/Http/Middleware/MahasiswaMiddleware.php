<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

class MahasiswaMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        try {
            // Get token from session
            $token = session('jwt_token');
            
            if (!$token) {
                return redirect('/login');
            }

            // Set token and authenticate
            JWTAuth::setToken($token);
            $user = JWTAuth::authenticate();
            
            if (!$user) {
                session()->flush();
                return redirect('/login');
            }

            if ($user->role->name !== 'mahasiswa') {
                abort(403, 'Unauthorized - Student access only');
            }

            return $next($request);
            
        } catch (JWTException $e) {
            session()->flush();
            return redirect('/login');
        }
    }
}
