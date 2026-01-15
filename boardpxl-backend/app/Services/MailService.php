<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

/**
 * @class MailService
 * @brief Service de gestion de l'envoi d'emails
 * 
 * Cette classe fournit des méthodes pour envoyer des emails via la plateforme.
 * Elle utilise la facade Mail de Laravel pour gérer l'envoi des messages.
 * 
 * @author SportPxl Team
 * @version 1.0.0
 * @date 2026-01-13
 */
class MailService
{
    /**
     * @brief Envoie un email brut (texte)
     * 
     * Envoie un email en texte brut au destinataire spécifié.
     * Configure l'expéditeur comme 'noreply@boardpxl.com' et permet
     * une réponse vers l'adresse spécifiée dans $from.
     * 
     * @param string $to Adresse email du destinataire
     * @param string $from Adresse email de réponse (reply-to)
     * @param string $subject Sujet de l'email
     * @param string $body Corps du message en texte brut
     * @return void
     */
    public function sendEmail($to, $from, $subject, $body){
        Mail::raw($body, function ($message) use ($to, $from, $subject) {
            $message->to($to)
                    ->from('noreply@boardpxl.com', 'BoardPXL')
                    ->replyTo($from)
                    ->subject($subject);
        });
    }
}