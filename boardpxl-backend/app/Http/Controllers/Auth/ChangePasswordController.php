<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ChangePasswordController extends Controller
{
    /**
     * Changer le mot de passe pour un utilisateur authentifié.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function change(Request $request): JsonResponse
    {
        // Récupérer l'utilisateur authentifié
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Non authentifié.'], 401);
        }

        // Validation des données
        $validated = $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        // Vérifier que le mot de passe actuel est correct
        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json(['message' => 'Le mot de passe actuel est incorrect.'], 422);
        }

        // Vérifier que le nouveau mot de passe est différent de l'ancien
        if ($validated['current_password'] === $validated['password']) {
            return response()->json(['message' => 'Le nouveau mot de passe doit être différent de l\'ancien.'], 422);
        }

        // Mettre à jour le mot de passe
        $user->update([
            'password' => Hash::make($validated['password']),
            'first_login_at' => now(), // Marquer comme première connexion terminée
        ]);

        return response()->json(['message' => 'Mot de passe changé avec succès.']);
    }
}
