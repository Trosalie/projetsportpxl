<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class ResetPasswordController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Password Reset Controller
    |--------------------------------------------------------------------------
    |
    | This controller is responsible for handling password reset requests
    | and uses a simple trait to include this behavior. You're free to
    | explore this trait and override any methods you wish to tweak.
    |
    */

    /**
     * Réinitialiser le mot de passe via l'API.
     *
     * @param Request $request
     * @return JsonResponse
     * @throws ValidationException
     */
    public function reset(Request $request)
    {
        // Validation des données d'entrée
        $validator = Validator::make($request->all(), [
            'token' => 'required|string',
            'email' => 'required|email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        // Si la validation échoue, renvoyer une erreur
        if ($validator->fails()) {
            throw ValidationException::withMessages($validator->errors()->toArray());
        }

        // Tentative de réinitialisation du mot de passe
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => bcrypt($password),
                ])->save();
            }
        );

        // Vérifier si la réinitialisation a réussi
        if ($status === Password::PASSWORD_RESET) {
            return response()->json(['message' => 'Mot de passe réinitialisé avec succès.']);
        }

        // En cas d'échec de la réinitialisation
        return response()->json(['message' => 'Le token de réinitialisation est invalide ou expiré.'], 400);
    }
}
