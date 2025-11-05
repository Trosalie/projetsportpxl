<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CreditInvoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'credits',
        'montant_ttc',
        'taxe'
    ];

    public function invoice()
    {
        return $this->morphOne(\App\Models\Invoice::class, 'invoiceable');
    }
}
