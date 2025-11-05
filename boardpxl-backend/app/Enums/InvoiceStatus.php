<?php

namespace App\Enums;

enum InvoiceStatus: string
{
    case NON_PAYEE = 'Non payée';
    case PAYEE = 'Payée';
    case EN_RETARD = 'En retard';
}