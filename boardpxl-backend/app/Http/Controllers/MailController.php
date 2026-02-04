<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\MailService;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
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

    public static function sendWelcomeMail($toEmail, $photographerName, $password)
    {
        $subject = 'Bienvenue sur BoardPXL, ' . $photographerName . ' !';
        $htmlBody = "<!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <title>Bienvenue sur BoardPXL</title>
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    background-color: #E8EAF6;
                    font-family: 'Segoe UI', Arial, sans-serif;
                }
                .email-container {
                    max-width: 600px;
                    margin: 40px auto;
                    background-color: #FFFFFF;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                }
                .email-header {
                    background-color: #F98524;
                    padding: 30px 20px;
                    text-align: center;
                }
                .email-header h1 {
                    color: #FFFFFF;
                    margin: 0;
                    font-size: 28px;
                    font-weight: bold;
                }
                .email-body {
                    padding: 40px 30px;
                    color: #333333;
                    line-height: 1.8;
                }
                .email-body p {
                    margin: 0 0 20px 0;
                    font-size: 16px;
                }
                .greeting {
                    font-size: 18px;
                    font-weight: 600;
                    color: #1f1f1f;
                }
                .password-box {
                    background-color: #FFF8F2;
                    border-left: 4px solid #F98524;
                    padding: 15px 20px;
                    margin: 25px 0;
                    border-radius: 4px;
                }
                .password-box p {
                    margin: 0;
                }
                .password-label {
                    font-size: 14px;
                    color: #666666;
                    margin-bottom: 8px;
                }
                .password-value {
                    font-size: 20px;
                    font-weight: bold;
                    color: #F98524;
                    font-family: 'Courier New', monospace;
                    letter-spacing: 1px;
                }
                .footer {
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #E8EAF6;
                    color: #666666;
                    font-size: 14px;
                }
                .signature {
                    font-weight: 600;
                    color: #F98524;
                }
            </style>
        </head>
        <body>
            <div class='email-container'>
                <div class='email-header'>
                    <h1>🎉 Bienvenue sur BoardPXL</h1>
                </div>
                <div class='email-body'>
                    <p class='greeting'>Bonjour $photographerName,</p>
                    <p>Nous sommes ravis de vous compter parmi nos photographes ! BoardPXL est votre nouvelle plateforme pour gérer vos factures liées à votre activité de photographe sur <a href=\"https://www.app.sportpxl.com/\" target=\"_blank\">SportPXL</a>.</p>
                    <p>Pour vous connecter à votre espace, utilisez vos identifiants :</p>
                    <div class='password-box'>
                        <p class='password-label'>Votre mot de passe temporaire :</p>
                        <p class='password-value'>$password</p>
                    </div>
                    <p><strong>Important :</strong> Pour votre sécurité, nous vous recommandons de modifier ce mot de passe lors de votre première connexion.</p>
                    <div class='footer'>
                        <p>N'hésitez pas à explorer notre plateforme et à nous contacter si vous avez des questions.</p>
                        <p class='signature'>Cordialement,<br>L'équipe SportPXL</p>
                    </div>
                </div>
            </div>
        </body>
        </html>";


        try {
            Mail::send([], [], function ($message) use ($toEmail, $subject, $htmlBody) {
                $message->to($toEmail)
                        ->subject($subject)
                        ->html($htmlBody);
            });

            if (Mail::failures()) {
                throw new \Exception('Échec de l\'envoi du mail de bienvenue.');
            }
        } catch (\Exception $e) {
            // Log the error or handle it as needed
            Log::error('Failed to send welcome email: ' . $e->getMessage());
        }
    }
}
