<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @class Logs
 * @brief Modèle pour la journalisation des actions utilisateurs
 * 
 * Cette classe enregistre toutes les actions effectuées par les utilisateurs
 * de la plateforme, incluant l'action, l'utilisateur, la table concernée et l'IP.
 * 
 * @author SportPxl Team
 * @version 1.0.0
 * @date 2026-01-13
 */
class Logs extends Model
{
    use HasFactory;

    /**
     * @var array $fillable Attributs assignables en masse
     * Définit les informations des logs d'actions qui peuvent être enregistrées
     */
    protected $fillable = [
        'action_id',
        'user_id',
        'table_name',
        'ip_address',
        'details',
    ];

    /**
     * @brief Relation Many-to-One avec LogActions
     * 
     * Retourne le type d'action associé à ce log.
     * Chaque log appartient à un type d'action spécifique.
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function logAction(){
        return $this->belongsTo(LogActions::class);
    }
}
