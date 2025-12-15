<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Ramsey\Collection\Collection;

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
        'total_limit',
        'fee_in_percent',
        'fix_fee',
        'street_address',
        'postal_code',
        'locality',
        'country',
        'iban'
    ];

    public function invoicesCredit()
    {
        return $this->hasMany(\App\Models\InvoiceCredit::class);
    }

    public function invoicesPayment()
    {
        return $this->hasMany(\App\Models\InvoicePayment::class);
    }

    public function findProfilData(string $email)
    {
        return DB::table('photographers')
            ->select('email', 'family_name', 'given_name', 'name', 'nb_imported_photos', 'total_limit', 'street_address', 'postal_code', 'locality', 'country')
            ->where('email', $email)
            ->first();
    }
}
