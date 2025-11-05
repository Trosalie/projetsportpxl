<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Photographer extends Model
{
    use HasFactory;

    protected $fillable = [
        'aws_sub',
        'email',
        'family_name',
        'given_name',
        'name',
        'customer_stripe_id',
        'nb_imported_photos',
        'total_limit'
    ];

    public function invoices()
    {
        return $this->hasMany(\App\Models\Invoice::class);
    }
}
