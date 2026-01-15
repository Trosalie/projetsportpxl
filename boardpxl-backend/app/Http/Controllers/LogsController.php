<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;
use App\Services\PennylaneService;
use App\Services\MailService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Services\LogService;

/**
 * @class LogsController
 * @brief Contrôleur de consultation des logs d'actions
 * 
 * Permet de récupérer et consulter l'historique des actions
 * effectuées par les utilisateurs de la plateforme.
 * 
 * @author SportPxl Team
 * @version 1.0.0
 * @date 2026-01-13
 */
class LogsController extends Controller
{
    /**
     * @brief Récupère tous les logs d'actions depuis la base de données
     * 
     * Effectue une jointure entre les tables logs, log_actions et photographers
     * pour retourner l'historique complet des actions avec les informations
     * des utilisateurs et types d'actions. Trié par date décroissante.
     * 
     * @param Request $request Requête HTTP
     * @return \Illuminate\Http\JsonResponse Liste des logs ou message d'erreur
     */
    public function getLogs(Request $request)
    {
        try {
            $logs = DB::table('logs')
                ->join('log_actions', 'logs.action_id', '=', 'log_actions.id')
                ->join('photographers', 'logs.user_id', '=', 'photographers.id')
                ->select('logs.*', 'log_actions.action', 'photographers.name as photographer_name')
                ->orderBy('logs.created_at', 'desc')
                ->get();

            return response()->json($logs);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }
}
