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
        'pdf_invoice_subject'
    ];

    protected $casts = [
        'issue_date' => 'date',
        'due_date' => 'date',
        'start_period' => 'date',
        'end_period' => 'date',
    ];

    public function photographer()
    {
        return $this->belongsTo(Photographer::class);
    }
}
