<?php

namespace App\Http\Controllers\Auth;

use Illuminate\Foundation\Auth\SendsPasswordResetEmails;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Password;

class ForgotPasswordController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Password Reset Controller
    |--------------------------------------------------------------------------
    |
    | This controller is responsible for handling password reset emails and
    | includes a trait which assists in sending these notifications from
    | your application to your users. Feel free to explore this trait.
    |
    */

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

        // Envoi du lien de réinitialisation
        $status = Password::sendResetLink($validated);

        // Si l'envoi échoue, retourner une erreur
        if ($status === Password::RESET_LINK_SENT) {
            return response()->json(['message' => 'Lien de réinitialisation envoyé.']);
        }

        // En cas d'erreur, retourner une erreur
        return response()->json(['message' => 'Echec de l\'envoi du lien.'], 400);
    }

    use SendsPasswordResetEmails;
}
