<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Enums\InvoiceStatus;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'description',
        'date_emission',
        'date_echeance',
        'statut',
        'lien_pdf',
        'photographer_id',
    ];

    protected $casts = [
        'date_emission' => 'date',
        'date_echeance' => 'date',
        'statut' => InvoiceStatus::class,
    ];

    public function photographer()
    {
        return $this->belongsTo(\App\Models\Photographer::class);
    }

    public function invoiceable()
    {
        return $this->morphTo();
    }
}
