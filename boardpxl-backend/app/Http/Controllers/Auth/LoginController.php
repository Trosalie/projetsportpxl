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
    public function login(Request $request): JsonResponse
    {
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

    /**
     * Déconnecter l'utilisateur (effacer le token).
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnexion réussie']);
    }
}
