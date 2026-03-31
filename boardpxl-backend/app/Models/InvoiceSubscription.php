<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InvoiceSubscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'number',
        'issue_date',
        'due_date',
        'description',
        'amount',
        'tax',
        'vat',
        'reduction',
        'total_due',
        'start_period',
        'end_period',
        'link_pdf',
        'pdf_invoice_subject',
        'status',
    ];

    /**
     * @var array $dates Attributs de type date
     * Ces attributs seront automatiquement convertis en instances Carbon
     */
    protected $dates = [
        'issue_date',
        'due_date',
        'start_period',
        'end_period',
    ];

    /**
     * @var array $casts Conversions de types pour les attributs financiers
     * Définit les types decimal avec 2 décimales pour les montants
     */
    protected $casts = [
        'amount' => 'decimal:2',
        'tax' => 'decimal:2',
        'vat' => 'decimal:2',
        'reduction' => 'decimal:2',
        'total_due' => 'decimal:2'
    ];

    /**
     * @brief Relation Many-to-One avec Photographer
     *
     * Retourne le photographe bénéficiaire de cette facture de versement.
     * Chaque facture d'abonnement appartient à un seul photographe.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function photographer()
    {
        return $this->belongsTo(Photographer::class);
    }
}
