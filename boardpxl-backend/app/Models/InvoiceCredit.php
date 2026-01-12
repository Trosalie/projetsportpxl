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
        'amount',
        'tax',
        'vat',
        'total_due',
        'credits',
        'status',
        'link_pdf',
        'pdf_invoice_subject'
    ];

    protected $dates = [
        'issue_date',
        'due_date',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'tax' => 'decimal:2',
        'vat' => 'decimal:2',
        'total_due' => 'decimal:2',
        'credits' => 'integer',
    ];

    public function photographer()
    {
        return $this->belongsTo(Photographer::class);
    }
}
