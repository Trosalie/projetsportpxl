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
        'total_due',
        'credits',
        'status',
        'link_pdf',
        'pdf_invoice_subject',

        'external_id',
        'pennylane_invoice_number',
        'customer_name',
        'total_amount',
        'currency',
        'issued_at',
        'due_at',
        'updated_at_api',
    ];

    protected $dates = [
        'issue_date',
        'due_date',
        'issued_at',
        'due_at',
        'updated_at_api'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'tax' => 'decimal:2',
        'vat' => 'decimal:2',
        'total_due' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'credits' => 'integer',
    ];

    public function photographer()
    {
        return $this->belongsTo(Photographer::class);
    }
}
