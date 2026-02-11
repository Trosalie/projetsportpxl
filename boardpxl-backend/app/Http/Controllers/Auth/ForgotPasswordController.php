<?php

namespace App\Http\Controllers\Auth;

// trait removed: project uses explicit implementation of sendResetLinkEmail
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\Photographer;
use App\Notifications\ResetPasswordNotification;

class ForgotPasswordController extends Controller
{
    /**
     * Envoyer un lien de réinitialisation de mot de passe par email.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function sendResetLinkEmail(Request $request): JsonResponse
    {
        // Validation des données
        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        // Vérifier que l'utilisateur existe
        $photographer = Photographer::where('email', $validated['email'])->first();
        
        if (!$photographer) {
            // Pour des raisons de sécurité, ne pas révéler si l'email existe
            return response()->json(['message' => 'Si cet email existe, un lien de réinitialisation a été envoyé.']);
        }

        // Générer un token unique
        $token = Str::random(64);
        
        // Stocker le token dans la table password_resets
        DB::table('password_resets')->updateOrInsert(
            ['email' => $validated['email']],
            [
                'token' => \Hash::make($token),
                'created_at' => now(),
            ]
        );

        // Envoyer une notification avec le lien de réinitialisation
        $photographer->notify(new ResetPasswordNotification($token));

        return response()->json(['message' => 'Si cet email existe, un lien de réinitialisation a été envoyé.']);
    }

    use SendsPasswordResetEmails;
}
