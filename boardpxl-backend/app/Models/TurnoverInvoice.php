<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TurnoverInvoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'chiffre_affaires',
        'commission',
        'valeur_brut',
        'taxe'
    ];

    public function invoice()
    {
        return $this->morphOne(\App\Models\Invoice::class, 'invoiceable');
    }
}
