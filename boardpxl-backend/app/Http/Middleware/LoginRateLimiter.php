<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class LoginRateLimiter
{
    /**
     * Handle an incoming request.
     * Limite les tentatives de connexion :
     * - Après 3 échecs : blocage 1 minute
     * - Après 6 échecs : blocage 5 minutes
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $ip = $request->ip();
        $email = $request->input('email', 'unknown');
        $key = 'login_attempts:' . $ip . ':' . $email;
        $blockKey = 'login_blocked:' . $ip . ':' . $email;

        // Vérifier si l'IP/email est bloqué
        if (Cache::has($blockKey)) {
            $blockData = Cache::get($blockKey);
            $remainingTime = Cache::get($blockKey . ':time');
            
            return response()->json([
                'message' => 'Trop de tentatives échouées. Veuillez réessayer plus tard.',
                'blocked_until' => $remainingTime,
                'attempts' => $blockData['attempts'],
                'block_duration' => $blockData['duration']
            ], 429);
        }

        // Continuer avec la requête
        $response = $next($request);

        // Si la connexion a échoué (status 401)
        if ($response->status() === 401) {
            // Incrémenter le compteur de tentatives
            $attempts = Cache::get($key, 0) + 1;
            Cache::put($key, $attempts, now()->addMinutes(10));

            // Déterminer le blocage selon le nombre de tentatives
            if ($attempts >= 6) {
                // Blocage de 5 minutes après 6 tentatives
                $blockDuration = 5;
                $blockUntil = now()->addMinutes($blockDuration);
                Cache::put($blockKey, [
                    'attempts' => $attempts,
                    'duration' => $blockDuration
                ], $blockUntil);
                Cache::put($blockKey . ':time', $blockUntil->timestamp, $blockUntil);

                return response()->json([
                    'message' => 'Compte temporairement bloqué après 6 tentatives échouées.',
                    'blocked_until' => $blockUntil->timestamp,
                    'attempts' => $attempts,
                    'block_duration' => $blockDuration
                ], 429);

            } elseif ($attempts >= 3) {
                // Blocage de 1 minute après 3 tentatives
                $blockDuration = 1;
                $blockUntil = now()->addMinutes($blockDuration);
                Cache::put($blockKey, [
                    'attempts' => $attempts,
                    'duration' => $blockDuration
                ], $blockUntil);
                Cache::put($blockKey . ':time', $blockUntil->timestamp, $blockUntil);

                return response()->json([
                    'message' => 'Trop de tentatives échouées. Compte bloqué pendant 1 minute.',
                    'blocked_until' => $blockUntil->timestamp,
                    'attempts' => $attempts,
                    'block_duration' => $blockDuration
                ], 429);
            }

            // Modifier la réponse pour inclure le nombre de tentatives restantes
            $remainingAttempts = 3 - ($attempts % 3);
            $originalData = json_decode($response->getContent(), true);
            $originalData['remaining_attempts'] = $remainingAttempts;
            $originalData['attempts'] = $attempts;
            
            return response()->json($originalData, 401);
        }

        // Si la connexion a réussi (status 200), réinitialiser les tentatives
        if ($response->status() === 200) {
            Cache::forget($key);
            Cache::forget($blockKey);
            Cache::forget($blockKey . ':time');
        }

        return $response;
    }
}
