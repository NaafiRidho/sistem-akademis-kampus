<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Tymon\JWTAuth\Facades\JWTAuth;

class LoginController extends Controller
{
    public function showLoginForm()
    {
        return Inertia::render('Auth/Login');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!$token = JWTAuth::attempt($credentials)) {
            return back()->withErrors([
                'email' => 'Email atau password salah.',
            ])->onlyInput('email');
        }

        $user = auth('api')->user();
        
        // Store token and user in session
        $request->session()->put('jwt_token', $token);
        $request->session()->put('user_id', $user->id);
        $request->session()->save(); // Force save session
        
        // Get redirect URL based on role
        if ($user->role->name === 'admin') {
            return redirect('/admin/dashboard');
        } elseif ($user->role->name === 'dosen') {
            return redirect('/dosen/dashboard');
        } elseif ($user->role->name === 'mahasiswa') {
            return redirect('/mahasiswa/dashboard');
        }

        return redirect('/');
    }

    public function logout(Request $request)
    {
        try {
            $token = session('jwt_token');
            if ($token) {
                JWTAuth::setToken($token);
                JWTAuth::invalidate();
            }
        } catch (\Exception $e) {
            // Token already invalid
        }
        
        session()->flush();
        
        return redirect('/login');
    }

    public function me()
    {
        return response()->json(auth('api')->user());
    }

    public function refresh()
    {
        return response()->json([
            'token' => JWTAuth::refresh(JWTAuth::getToken())
        ]);
    }
}
