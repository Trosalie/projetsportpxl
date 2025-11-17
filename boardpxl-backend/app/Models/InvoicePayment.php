<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InvoicePayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'turnover',
        'raw_value',
        'commission',
        'start_period',
        'end_period',
    ];

    protected $casts = [
        'start_period' => 'date',
        'end_period' => 'date',
    ];

    public function invoices()
    {
        return $this->morphMany(Invoice::class, 'invoiceable');
    }

    public function invoice()
    {
        return $this->morphOne(Invoice::class, 'invoiceable');
    }
}
