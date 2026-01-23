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
        'raw_value',
        'tax',
        'vat',
        'start_period',
        'end_period',
        'link_pdf',
        'pdf_invoice_subject',
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
     * @var array $casts Conversions de types pour les attributs financiers
     * Définit les types decimal avec 2 décimales pour les montants
     */
    protected $casts = [
        'tax' => 'decimal:2',
        'vat' => 'decimal:2',
        'raw_value' => 'decimal:2',
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
