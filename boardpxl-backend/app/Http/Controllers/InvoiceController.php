<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;
use App\Services\PennylaneService;
use App\Services\MailService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class InvoiceController extends Controller
{
    public function getInvoicesPaymentByPhotographer($photographer_id)
    {
        try {
        if (!is_numeric($photographer_id)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid photographer id',
            ], 422);
        }

            $invoices = DB::table('invoice_payments')
                ->where('photographer_id', $photographer_id)
                ->get();
            return response()->json($invoices);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur : ' . $e->getMessage(),
            ], 500);
        }
    }

    public function getInvoicesCreditByPhotographer($photographer_id)
    {
        try {
        if (!is_numeric($photographer_id)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid photographer id',
            ], 422);
        }

        $invoices = DB::table('invoice_credits')
            ->where('photographer_id', $photographer_id)
            ->get();
        return response()->json($invoices);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur : ' . $e->getMessage(),
            ], 500);
        }
    }
}
