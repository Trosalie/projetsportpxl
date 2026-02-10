<?php

namespace App\Http\Controllers\Auth;


use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use App\Services\LogService;


class LoginController extends Controller
{
    private LogService $logService;

    public function __construct(LogService $logService)
    {
        $this->logService = $logService;
    }

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
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (Auth::guard('web')->attempt($credentials)) {
        $photographer = Auth::guard('web')->user();

        // Créer un token API pour l'authentification
        $token = $photographer->createToken('API Token')->plainTextToken;

        $this->logService->logAction($request, 'login', 'USERS', [
            'user_id' => $photographer->id,
            'email' => $photographer->email,
        ]);

        return response()->json([
            'message' => 'Login successful',
            'user' => $photographer,
            'token' => $token
        ], 200);

    }

        $this->logService->logAction($request, 'login_failed', 'USERS', [
            'email' => $credentials['email'],
        ]);

        return response()->json([
            'message' => 'Invalid credentials'
        ], 401);
    }

    public function logout(Request $request)
    {
        $userId = Auth::id();
        
        Auth::guard('web')->logout();

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        $this->logService->logAction($request, 'logout', 'USERS', [
            'user_id' => $userId,
        ]);

        return response()->json([
            'message' => 'Logged out successfully'
        ], 200);
    }
}
