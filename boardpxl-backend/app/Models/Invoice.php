<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'number',
        'issue_date',
        'due_date',
        'description',
        'tax',
        'vat',
        'link_pdf'
    ];

    protected $casts = [
        'issue_date' => 'date',
        'due_date' => 'date',
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
