<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'description',
        'issue_date',
        'due_date',
        'status',
        'link_pdf',
        'photographer_id',
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
