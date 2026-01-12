<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InvoicePayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'number',
        'issue_date',
        'due_date',
        'description',
        'raw_value',
        'commission',
        'tax',
        'vat',
        'start_period',
        'end_period',
        'link_pdf',
        'pdf_invoice_subject',
    ];

    protected $dates = [
        'issue_date',
        'due_date',
    ];

    protected $casts = [
        'tax' => 'decimal:2',
        'vat' => 'decimal:2',
        'raw_value' => 'decimal:2',
    ];

    public function photographer()
    {
        return $this->belongsTo(Photographer::class);
    }
}
