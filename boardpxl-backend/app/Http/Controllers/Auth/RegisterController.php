<?php

namespace App\Http\Controllers\Auth;

use App\Models\Photographer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class RegisterController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Register Controller
    |--------------------------------------------------------------------------
    |
    | This controller handles the registration of new users as well as their
    | validation and creation. By default, this controller uses a trait to
    | provide this functionality without requiring any additional code.
    |
    */

    /**
     * Inscription d'un nouvel utilisateur via l'API.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function register(Request $request): JsonResponse
    {
        // Validation des données d'inscription
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:photographers',
            'password' => 'required|min:8|confirmed',
        ]);

        // Création de l'utilisateur
        $photographer = Photographer::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
        ]);

        // Création d'un token API pour l'utilisateur
        $token = $photographer->createToken('API Token')->plainTextToken;

        // Retourner une réponse JSON avec l'utilisateur et le token
        return response()->json([
            'photographer' => $photographer,
            'token' => $token,
        ]);
    }
}
