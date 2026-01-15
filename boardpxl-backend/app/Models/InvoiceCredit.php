<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @class InvoiceCredit
 * @brief Modèle représentant une facture d'achat de crédits
 * 
 * Cette classe gère les factures émises lors de l'achat de crédits par un photographe.
 * Les crédits permettent d'utiliser les services de la plateforme SportPxl.
 * 
 * @author SportPxl Team
 * @version 1.0.0
 * @date 2026-01-13
 */
class InvoiceCredit extends Model
{
    use HasFactory;

    /**
     * @var array $fillable Attributs assignables en masse
     * Définit les champs qui peuvent être remplis lors de la création/mise à jour
     */
    protected $fillable = [
        'number',
        'issue_date',
        'due_date',
        'amount',
        'tax',
        'vat',
        'total_due',
        'credits',
        'status',
        'link_pdf',
        'pdf_invoice_subject'
    ];

    /**
     * @var array $dates Attributs de type date
     * Ces attributs seront automatiquement convertis en instances Carbon
     */
    protected $dates = [
        'issue_date',
        'due_date',
    ];

    /**
     * @var array $casts Conversions de types pour les attributs
     * Définit les types de données pour la conversion automatique (decimal, integer)
     */
    protected $casts = [
        'amount' => 'decimal:2',
        'tax' => 'decimal:2',
        'vat' => 'decimal:2',
        'total_due' => 'decimal:2',
        'credits' => 'integer',
    ];

    /**
     * @brief Relation Many-to-One avec Photographer
     * 
     * Retourne le photographe propriétaire de cette facture de crédit.
     * Chaque facture de crédit appartient à un seul photographe.
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function photographer()
    {
        return $this->belongsTo(Photographer::class);
    }
}
