<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InvoiceCredit extends Model
{
    use HasFactory;

    protected $fillable = [
        'amount',
        'reduction_in_percent',
        'fix_reduction',
        'total_due',
        'credits',
        'status'
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
