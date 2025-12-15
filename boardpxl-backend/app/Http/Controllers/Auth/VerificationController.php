<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class VerificationController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Email Verification Controller
    |--------------------------------------------------------------------------
    |
    | This controller is responsible for handling email verification for any
    | user that recently registered with the application. Emails may also
    | be re-sent if the user didn't receive the original email message.
    |
    */

    /**
     * Créer une nouvelle instance de VerificationController.
     */
    public function __construct()
    {
        $this->middleware('auth:sanctum'); // Utilisation de l'authentification sanctum
    }

    /**
     * Vérifier l'email de l'utilisateur via l'API.
     *
     * @param Request $request
     * @param $id
     * @return JsonResponse
     */
    public function verify(Request $request, $id)
    {
        // Vérification de l'email
        $user = \App\Models\User::findOrFail($id);

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'L\'email est déjà vérifié.']);
        }

        // Vérifier le token de l'utilisateur
        if ($request->hasValidSignature()) {
            $user->markEmailAsVerified();
            return response()->json(['message' => 'Email vérifié avec succès.']);
        }

        return response()->json(['message' => 'Lien de vérification invalide.'], 400);
    }

    /**
     * Renvoi du lien de vérification par email.
     *
     * @param  Request  $request
     * @return JsonResponse
     */
    public function resend(Request $request)
    {
        $user = Auth::user();

        // Vérifier si l'utilisateur a déjà vérifié son email
        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'L\'email est déjà vérifié.']);
        }

        // Si l'utilisateur n'a pas vérifié son email, renvoyer l'email
        $user->sendEmailVerificationNotification();

        return response()->json(['message' => 'Email de vérification renvoyé avec succès.']);
    }
}
