<?php

namespace App\Services;

use Illuminate\Http\Request;
use App\Models\Logs;
use App\Models\LogActions;
use Illuminate\Support\Facades\Auth;

/**
 * @class LogService
 * @brief Service de journalisation des actions utilisateurs
 * 
 * Cette classe gère l'enregistrement des actions effectuées par les utilisateurs
 * dans la base de données. Elle utilise un cache interne pour optimiser les performances
 * lors de la recherche des IDs d'actions.
 * 
 * @author SportPxl Team
 * @version 1.0.0
 * @date 2026-01-13
 */
class LogService
{
    /**
     * @var array $actionCache Cache statique pour les IDs d'actions
     * Stocke les IDs d'actions pour éviter des requêtes répétitives en base de données
     */
    private static $actionCache = [];

    /**
     * @brief Enregistre une action utilisateur dans les logs
     * 
     * Crée une entrée de log pour l'action spécifiée, incluant l'utilisateur,
     * la table concernée, l'adresse IP et des détails supplémentaires optionnels.
     * Si l'utilisateur n'est pas authentifié ou l'action n'existe pas, le log n'est pas créé.
     * 
     * @param Request $request Requête HTTP contenant les informations de contexte
     * @param string $action Nom de l'action à journaliser
     * @param string|null $tableName Nom de la table concernée (optionnel)
     * @param array $details Informations supplémentaires à enregistrer (optionnel)
     * @return void
     */
    public function logAction(Request $request, string $action, ?string $tableName = null, array $details = []): void
    {
        $userId = Auth::id() ?? optional($request->user())->id;

        if (!$userId) {
            return;
        }

        // Get action_id from cache or database
        $actionId = $this->getActionId($action);
        
        if (!$actionId) {
            return; // Skip if action not found
        }

        Logs::create([
            'action_id' => $actionId,
            'user_id' => $userId,
            'table_name' => $tableName ? strtoupper($tableName) : null,
            'ip_address' => $request->ip(),
            'details' => $details ? json_encode($details) : null,
        ]);
    }

    /**
     * @brief Récupère l'ID d'une action depuis le cache ou la base de données
     * 
     * Recherche l'ID de l'action dans le cache statique en premier lieu.
     * Si l'action n'est pas en cache, effectue une requête en base de données
     * et met à jour le cache avec le résultat.
     * 
     * @param string $action Nom de l'action à rechercher
     * @return int|null ID de l'action ou null si non trouvée
     */
    private function getActionId(string $action): ?int
    {
        if (!isset(self::$actionCache[$action])) {
            $logAction = LogActions::where('action', $action)->first();
            self::$actionCache[$action] = $logAction ? $logAction->id : null;
        }
        
        return self::$actionCache[$action];
    }
}