<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
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
  
      /**
     * add to the db a turnover invoice with specific information
     *
     * @param Request $request
     * @return JsonResponse
     */
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
            'turnover'=> 'nullable|numeric',
            'montant'=> 'nullable|numeric',
            'commission'=> 'nullable|numeric',
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
                'description' => $validated['description'] ?? '',
                'raw_value' => $validated['raw_value'],
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

    /**
     * add to the db a credit invoice with specific information
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function insertCreditsInvoice(Request $request)
    {
        // Validation des données
        $validated = $request->validate([
            'id' => 'required|numeric',
            'number' => 'required|string',
            'issue_date' => 'required|date',
            'due_date' => 'required|date',
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

    /**
     * get all payment invoices from a photographer
     *
     * @param int $photographer_id
     * @return JsonResponse
     */    
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

    /**
     * get all credit invoices from a photographer
     *
     * @param int $photographer_id
     * @return JsonResponse
     */
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

    /**
     * Retourne factures d'un client
     */
    public function getInvoicesByClient($idClient)
    {
        try {
            if (!is_numeric($idClient)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid client id',
                ], 422);
            }

            $invoiceCredits = DB::table('invoice_credits')
                ->where('photographer_id', $idClient)
                ->get();
            
            $invoicePayments = DB::table('invoice_payments')
                ->where('photographer_id', $idClient)
                ->get();
            
            return response()->json(array_merge(
                $invoiceCredits->toArray(),
                $invoicePayments->toArray()
            ));
          } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur : ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get invoices for multiple photographers in bulk
     * Optimized endpoint to get all invoices with a single API call
     *
     * @param Request $request with 'photographer_ids' array
     * @return JsonResponse
     */
    public function getBulkInvoicesByPhotographers(Request $request)
    {
        try {
            $photographerIds = $request->input('photographer_ids', []);
            
            if (!is_array($photographerIds) || empty($photographerIds)) {
                return response()->json([
                    'success' => false,
                    'message' => 'photographer_ids array is required',
                ], 422);
            }

            $invoiceCredits = DB::table('invoice_credits')
                ->whereIn('photographer_id', $photographerIds)
                ->get()
                ->groupBy('photographer_id');
            
            $invoicePayments = DB::table('invoice_payments')
                ->whereIn('photographer_id', $photographerIds)
                ->get()
                ->groupBy('photographer_id');
            
            $result = [];
            foreach ($photographerIds as $id) {
                $result[$id] = [
                    'credits' => $invoiceCredits->get($id, collect())->values()->toArray(),
                    'payments' => $invoicePayments->get($id, collect())->values()->toArray()
                ];
            }
            
            return response()->json($result);
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

    /**
     * Récupère un produit d'une facture
     */
    public function getProductFromInvoice($invoiceNumber, PennylaneService $service)
    {
        $product = $service->getProductFromInvoice($invoiceNumber);

        if ($product) {
            return response()->json($product);
        }

        return response()->json([
            'success' => false,
            'message' => 'Produit non trouvé'
        ], 404);
    }

    /**
     * get the invoice with a specific id
     *
     * @param int $id
     * @return JsonResponse
     */
    public function getInvoiceById($id)
    {
        $invoice = DB::table('invoice_credits')
            ->where('id', $id)
            ->first();
        
        if (! $invoice) {
            $invoice = DB::table('invoice_payments')
                ->where('id', $id)
                ->first();
        }

        if (!$invoice) {
            return response()->json(['message' => 'Facture non trouvée'], 404);
        }

        return response()->json($invoice);
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
