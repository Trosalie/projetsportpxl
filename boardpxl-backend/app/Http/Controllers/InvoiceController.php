<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;
use App\Models\InvoicePayment;
use Illuminate\Support\Facades\DB;
use App\Services\PennylaneService;
use App\Services\LogService;


class InvoiceController extends Controller
{
    private LogService $logService;

    public function __construct(LogService $logService)
    {
        $this->logService = $logService;
    }
    public function insertTurnoverInvoice(Request $request)
    {
        // Validation des données entrantes
        $validated = $request->validate([
            'id'=> 'required|numeric',
            'number'=> 'required|string',
            'issue_date'=> 'required|date',
            'due_date'=> 'required|date',
            'description'=> 'nullable|string',
            'raw_value'=> 'required|numeric',
            'commission'=> 'required|numeric',
            'tax'=> 'required|numeric',
            'vat'=> 'required|numeric',
            'start_period'=> 'required|date',
            'end_period'=> 'required|date',
            'link_pdf'=> 'required|string',
            'photographer_id'=> 'required|numeric',
            'pdf_invoice_subject'=> 'required|string',
        ]);

        try {
            // Insertion directe dans la base de données
            DB::table('invoice_payments')->insert([
                'id' => $validated['id'],
                'number' => $validated['number'],
                'issue_date' => $validated['issue_date'],
                'due_date' => $validated['due_date'],
                'description' => $validated['description'],
                'raw_value' => $validated['raw_value'],
                'commission' => $validated['commission'],
                'tax' => $validated['tax'],
                'vat' => $validated['vat'],
                'start_period' => $validated['start_period'],
                'end_period' => $validated['end_period'],
                'link_pdf' => $validated['link_pdf'],
                'photographer_id' => $validated['photographer_id'],
                "pdf_invoice_subject" => $validated['pdf_invoice_subject'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $this->logService->logAction($request, 'insert_turnover_invoice', 'INVOICE_PAYMENTS', [
                'invoice_id' => $validated['id'],
                'photographer_id' => $validated['photographer_id'],
                'number' => $validated['number'],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Invoice stored successfully.',
            ], 201);
        } catch (\Exception $e) {
            $this->logService->logAction($request, 'insert_turnover_invoice_failed', 'INVOICE_PAYMENTS', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function insertCreditsInvoice(Request $request)
    {
        // Validation des données
        $validated = $request->validate([
            'id' => 'required|numeric',
            'number' => 'required|string',
            'issue_date' => 'required|date',
            'due_date' => 'required|date',
            'description' => 'nullable|string',
            'amount' => 'required|numeric',
            'tax' => 'required|numeric',
            'vat' => 'required|numeric',
            'total_due' => 'required|numeric',
            'credits' => 'required|numeric',
            'status' => 'required|string',
            'link_pdf' => 'required|string',
            'photographer_id' => 'required|numeric',
            'pdf_invoice_subject' => 'required|string',
        ]);

        try {
            // Insert SQL direct
            DB::table('invoice_credits')->insert([
                'id' => $validated['id'],
                'number' => $validated['number'],
                'issue_date' => $validated['issue_date'],
                'due_date' => $validated['due_date'],
                'description' => $validated['description']  ?? 'N/A',
                'amount' => $validated['amount'],
                'tax' => $validated['tax'],
                'vat' => $validated['vat'],
                'total_due' => $validated['total_due'], 
                'credits' => $validated['credits'],
                'status' => $validated['status'],
                'link_pdf' => $validated['link_pdf'],
                'photographer_id' => $validated['photographer_id'],
                'pdf_invoice_subject' => $validated['pdf_invoice_subject'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $this->logService->logAction($request, 'insert_credits_invoice', 'INVOICE_CREDITS', [
                'invoice_id' => $validated['id'],
                'photographer_id' => $validated['photographer_id'],
                'number' => $validated['number'],
                'credits' => $validated['credits'],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Credit invoice stored successfully.',
            ], 201);
        } catch (\Exception $e) {
            $this->logService->logAction($request, 'insert_credits_invoice_failed', 'INVOICE_CREDITS', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    
    public function getInvoicesPaymentByPhotographer(Request $request, $photographer_id)
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

    public function getInvoicesCreditByPhotographer(Request $request, $photographer_id)
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


    public function getFinancialInfoCreditsInvoice(){
        try {
            $invoices = DB::table('invoice_credits')
                ->select('id','issue_date', 'amount', 'credits')
                ->get();
            return response()->json($invoices);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur : ' . $e->getMessage(),
            ], 500);
        }
    }

    public function getFinancialInfoTurnoverInvoice(){
        try {
            $invoices = DB::table('invoice_payments')
                ->select('id','issue_date', 'raw_value', 'commission')
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
