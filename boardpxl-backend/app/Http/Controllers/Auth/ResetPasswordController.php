<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\Photographer;

class ResetPasswordController extends Controller
{
    /**
     * Réinitialiser le mot de passe via l'API.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function reset(Request $request): JsonResponse
    {
        // Validation des données d'entrée
        $validated = $request->validate([
            'token' => 'required|string',
            'email' => 'required|email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        // Vérifier que l'utilisateur existe
        $photographer = Photographer::where('email', $validated['email'])->first();
        
        if (!$photographer) {
            return response()->json(['message' => 'Email invalide.'], 400);
        }

        // Vérifier que le token existe et est valide
        $reset = DB::table('password_resets')
            ->where('email', $validated['email'])
            ->first();

        if (!$reset || !Hash::check($validated['token'], $reset->token)) {
            return response()->json(['message' => 'Token invalide ou expiré.'], 400);
        }

        // Vérifier que le token n'a pas expiré (60 minutes)
        if (now()->diffInMinutes($reset->created_at) > 60) {
            return response()->json(['message' => 'Le lien a expiré.'], 400);
        }

        // Mettre à jour le mot de passe
        $photographer->update([
            'password' => Hash::make($validated['password']),
        ]);

        // Supprimer le token après utilisation
        DB::table('password_resets')->where('email', $validated['email'])->delete();

        return response()->json(['message' => 'Mot de passe réinitialisé avec succès.']);
    }
}
