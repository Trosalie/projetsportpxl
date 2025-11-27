<?php

namespace App\Http\Controllers\Auth;


use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;


class LoginController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Login Controller
    |--------------------------------------------------------------------------
    |
    | This controller handles authenticating users for the application and
    | redirecting them to your home screen. The controller uses a trait
    | to conveniently provide its functionality to your applications.
    |
    */

    /**
     * Crée un nouvel utilisateur après la connexion via l'API.
     *
     * @param Request $request
     * @return JsonResponse
     * @throws ValidationException
     */
    public function login(Request $request)
    {
<<<<<<< HEAD
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (Auth::guard('web')->attempt($credentials)) {
        $photographer = Auth::guard('web')->user();
        
        // Créer un token API pour l'authentification
        $token = $photographer->createToken('API Token')->plainTextToken;
        
        return response()->json([
            'message' => 'Login successful',
            'user' => $photographer,
            'token' => $token
        ], 200);
=======
        try {
            $validated = $request->validate([
                'email' => 'required|email',
                'password' => 'required|min:8',
            ]);

            if (Auth::attempt($validated)) {
                $photographer = Auth::user();

                $token = $photographer->createToken('API Token')->plainTextToken;

                return response()->json([
                    'photographer' => $photographer,
                    'token' => $token,
                ]);
            }

            throw ValidationException::withMessages([
                'email' => ['Les informations d\'identification sont invalides.'],
            ]);
        }
        catch (\Exception $e) {
            \Log::error('Erreur lors de la tentative de connexion : ' . $e->getMessage());
            return response()->json(['message' => 'Erreur serveur'], 500);
        }
>>>>>>> d821f808e7f40f3fd89fb0a828ead85f1defba1a
    }

        return response()->json([
            'message' => 'Invalid credentials'
        ], 401);
    }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();
        
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        
        return response()->json([
            'message' => 'Logged out successfully'
        ], 200);
    }
}
