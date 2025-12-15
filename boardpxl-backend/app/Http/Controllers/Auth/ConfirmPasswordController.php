<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class ConfirmPasswordController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Confirm Password Controller
    |--------------------------------------------------------------------------
    |
    | This controller is responsible for handling password confirmations and
    | uses a simple trait to include the behavior. You're free to explore
    | this trait and override any functions that require customization.
    |
    */

    /**
     * Créer une nouvelle instance de ConfirmPasswordController.
     */
    public function __construct()
    {
        $this->middleware('auth:sanctum'); // Utilisation du middleware Sanctum pour protéger la route
    }

    /**
     * Confirmer le mot de passe de l'utilisateur pour effectuer une action sensible.
     *
     * @param Request $request
     * @return JsonResponse
     * @throws ValidationException
     */
    public function confirm(Request $request): JsonResponse
    {
        // Valider que le mot de passe est bien fourni dans la requête
        $request->validate([
            'password' => 'required|string',
        ]);

        // Vérifier si le mot de passe correspond à celui de l'utilisateur authentifié
        if (!Hash::check($request->password, Auth::user()->password)) {
            // Si le mot de passe ne correspond pas, lancer une exception de validation
            throw ValidationException::withMessages([
                'password' => ['Le mot de passe fourni est incorrect.'],
            ]);
        }

        // Si la confirmation du mot de passe est correcte, retourner une réponse JSON
        return response()->json(['message' => 'Mot de passe confirmé avec succès.']);
    }
}
