<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @class LogActions
 * @brief Modèle définissant les types d'actions journalisées
 * 
 * Cette classe définit les différents types d'actions qui peuvent être
 * enregistrées dans les logs, ainsi que les permissions associées.
 * 
 * @author SportPxl Team
 * @version 1.0.0
 * @date 2026-01-13
 */
class LogActions extends Model
{
    use HasFactory;

    /**
     * @var array $fillable Attributs assignables en masse
     * Définit les informations des types d'actions qui peuvent être créées
     */
    protected $fillable = [
        'action',
        'permission',
    ];

    /**
     * @brief Relation One-to-Many avec Logs
     * 
     * Retourne tous les logs associés à ce type d'action.
     * Un type d'action peut avoir plusieurs logs.
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function logs(){
        return $this->hasMany(Logs::class);
    }
}
