<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\MailService;
use Illuminate\Support\Facades\Mail;
use App\Models\MailLogs;
use App\Services\LogService;

/**
 * @class MailController
 * @brief Contrôleur de gestion des emails
 * 
 * Gère l'envoi d'emails et la consultation des logs d'envoi.
 * Utilise MailService pour l'envoi et enregistre tous les envois dans MailLogs.
 * 
 * @author SportPxl Team
 * @version 1.0.0
 * @date 2026-01-13
 */
class MailController extends Controller
{
    /**
     * @var LogService $logService Service de journalisation
     */
    private LogService $logService;

    /**
     * @brief Constructeur du contrôleur
     * @param LogService $logService Injection du service de logs
     */
    public function __construct(LogService $logService)
    {
        $this->logService = $logService;
    }


    /**
     * @brief Envoie un email via MailService
     * 
     * Valide les données de la requête, envoie l'email via MailService,
     * et enregistre le statut de l'envoi dans les logs. Journalise aussi
     * l'action via LogService.
     * 
     * @param Request $request Requête contenant les données de l'email
     * @param MailService $mailService Service d'envoi d'emails
     * @return \Illuminate\Http\JsonResponse Résultat de l'envoi
     */
    public function sendEmail(Request $request, MailService $mailService)
    {
        $validated = $request->validate([
            'to' => 'required|email',
            'from' => 'required|email',
            'subject' => 'required|string|max:255',
            'body' => 'required|string|max:10000',
            'type' => 'nullable|string|max:100',
        ]);

        try {
            $mailService->sendEmail(
                $validated['to'],
                $validated['from'],
                $validated['subject'],
                $validated['body']
            );

            MailLogs::create([
                'sender_id' => auth()->id() ?? 1, 
                'recipient' => $validated['to'],
                'subject' => $validated['subject'],
                'body' => $validated['body'],
                'status' => 'sent',
                'type' => $validated['type'] ?? 'generic'
            ]);

            $this->logService->logAction($request, 'send_email', 'MAIL_LOGS', [
                'to' => $validated['to'],
                'subject' => $validated['subject'],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Email sent successfully.'
            ]);

        } catch (\Exception $e) {
            MailLogs::create([
                'sender_id' => auth()->id() ?? 1, 
                'recipient' => $validated['to'],
                'subject' => $validated['subject'],
                'body' => $validated['body'],
                'status' => 'failed',
                'type' => $validated['type'] ?? 'generic'
            ]);

            $this->logService->logAction($request, 'send_email_failed', 'MAIL_LOGS', [
                'to' => $validated['to'],
                'subject' => $validated['subject'],
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to send email: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * @brief Teste l'envoi d'un email simple
     * 
     * Envoie un email de test à test@example.com pour vérifier
     * la configuration de l'envoi d'emails (utile avec Mailpit en Docker).
     * 
     * @return \Illuminate\Http\JsonResponse Résultat du test
     */
    public function testMail()
    {
        Mail::raw('Test Mailpit depuis Docker', function ($message) {
            $message->to('test@example.com')
                    ->subject('Hello from Mailpit');
        });

        if (Mail::failures()) {
            return response()->json(['message' => 'Échec de l\'envoi du mail.'], 500);
        }

        return response()->json(['message' => 'Mail envoyé (si tout va bien) !']);
    }

        /**
     * @brief Récupère les logs d'emails d'un photographe
     * 
     * Retourne l'historique des emails envoyés par un photographe spécifique,
     * triés par date d'envoi décroissante. Valide l'existence du photographe.
     * 
     * @param Request $request Requête HTTP
     * @param int $sender_id Identifiant du photographe expéditeur
     * @return \Illuminate\Http\JsonResponse Liste des logs ou message d'erreur
     */
        public function getLogs(Request $request, $sender_id)
        {
            try {
                // Valider l'ID du photographe passé en paramètre
                $validated = validator(
                    ['sender_id' => $sender_id],
                    ['sender_id' => 'required|integer|exists:photographers,id']
                )->validate();

                // Récupérer les logs de mails depuis la base de données via l'id du photographe validé
                $logs = MailLogs::where('sender_id', $validated['sender_id'])->orderBy('created_at', 'desc')->get();
                return response()->json($logs);
            } catch (\Exception $e) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to retrieve logs: ' . $e->getMessage()
                ], 500);
            }
        }
}
