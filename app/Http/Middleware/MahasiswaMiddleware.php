<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;

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

            // Check role exists and is mahasiswa
            if (!$user->role || $user->role->name !== 'mahasiswa') {
                abort(403, 'Unauthorized - Student access only');
            }

            return $next($request);
            
        } catch (TokenExpiredException $e) {
            // Token expired, try to refresh automatically
            try {
                $newToken = JWTAuth::refresh(JWTAuth::getToken());
                session()->put('jwt_token', $newToken);
                JWTAuth::setToken($newToken);
                
                // Continue with refreshed token
                $user = JWTAuth::authenticate();
                
                if (!$user || !$user->role || $user->role->name !== 'mahasiswa') {
                    session()->flush();
                    return redirect('/login')->with('info', 'Sesi berakhir, silakan login kembali');
                }
                
                return $next($request);
            } catch (JWTException $refreshException) {
                // Cannot refresh, redirect to login
                session()->flush();
                return redirect('/login')->with('info', 'Sesi berakhir, silakan login kembali');
            }
        } catch (JWTException $e) {
            session()->flush();
            return redirect('/login');
        }
    }
}
