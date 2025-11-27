<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;

class Photographer extends Authenticatable
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
        'total_limit',
        'fee_in_percent',
        'fix_fee',
        'street_address',
        'postal_code',
        'locality',
        'country',
        'iban',
        'password',
        'admin'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed'
    ];

    public function invoicesCredit()
    {
        return $this->hasMany(\App\Models\InvoiceCredit::class);
    }

    public function invoicesPayment()
    {
        return $this->hasMany(\App\Models\InvoicePayment::class);
    }
}
