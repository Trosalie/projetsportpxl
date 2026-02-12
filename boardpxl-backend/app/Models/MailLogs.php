<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @class MailLogs
 * @brief Modèle pour la journalisation des emails envoyés
 * 
 * Cette classe enregistre tous les emails envoyés via la plateforme,
 * incluant l'expéditeur, le destinataire, le sujet et le statut de l'envoi.
 * 
 * @author SportPxl Team
 * @version 1.0.0
 * @date 2026-01-13
 */
class MailLogs extends Model
{
    use HasFactory;

    /**
     * @var array $fillable Attributs assignables en masse
     * Définit les informations des logs d'emails qui peuvent être enregistrées
     */
    protected $fillable = [
        'sender_id',
        'recipient',
        'subject',
        'status',
        'body',
        'type'
    ];

    /**
     * @brief Relation Many-to-One avec Photographer
     * 
     * Retourne le photographe qui a envoyé cet email.
     * Chaque log d'email appartient à un photographe expéditeur.
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function photographer()
    {
        return $this->belongsTo(Photographer::class, 'sender_id');
    }
}
