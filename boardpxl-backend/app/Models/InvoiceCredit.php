<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InvoiceCredit extends Model
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
        'total-due',
        'credits',
        'status',
        'link_pdf',
        'pdf_invoice_subject'

    ];

    protected $casts = [
        'issue_date' => 'date',
        'due_date' => 'date',
    ];

    public function photographer()
    {
        return $this->belongsTo(\App\Models\Photographer::class);
    }
}
