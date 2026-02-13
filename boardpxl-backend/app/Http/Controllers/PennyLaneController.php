<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;
use App\Services\PennylaneService;
use App\Services\MailService;
use App\Services\LogService;

class PennyLaneController extends Controller
{
    private LogService $logService;

    public function __construct(LogService $logService)
    {
        $this->logService = $logService;
    }

    /**
     * Création d'une facture d'achat de crédit Pennylane
     */
    public function createCreditsInvoicePhotographer(Request $request, PennylaneService $service)
    {
        try {
            $validated = $request->validate([
                'labelTVA' => 'required|string',
                'labelProduct' => 'required|string',
                'description' => 'nullable|string',
                'amountEuro' => 'required|string',
                'issueDate' => 'required|string',
                'dueDate' => 'required|string',
                'idPhotographer' => 'required|integer',
                'invoiceTitle' => 'required|string',
                'discount' => 'nullable|numeric|min:0|max:1',
            ]);

            $description = $validated['description'] ?? "";
            $discount = isset($validated['discount']) ? strval(floatval($validated['discount']) * 100) : "0";

            $facture = $service->createCreditsInvoicePhotographer(
                $validated['labelTVA'],
                $validated['labelProduct'],
                $description,
                $validated['amountEuro'],
                $discount,
                $validated['issueDate'],
                $validated['dueDate'],
                (int) $validated['idPhotographer'],
                $validated['invoiceTitle']
            );

            $this->logService->logAction($request, 'create_credits_invoice_photographer', 'INVOICE_CREDITS', [
                'id_photographer' => (int) $validated['idPhotographer'],
                'invoice_title' => $validated['invoiceTitle'],
                'amount_euro' => $validated['amountEuro'],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Facture créée avec succès.',
                'data' => $facture
            ]);

        } catch (\Exception $e) {
            $this->logService->logAction($request, 'create_credits_invoice_photographer_failed', 'INVOICE_CREDITS', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur : ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Création d'une facture de versement de CA
     */
    public function createTurnoverPaymentInvoice(Request $request, PennylaneService $service)
    {
        try {
            $validated = $request->validate([
                'labelTVA' => 'required|string',
                'issueDate' => 'required|string',
                'dueDate' => 'required|string',
                'idPhotographer' => 'required|integer',
                'invoiceTitle' => 'required|string',
                'invoiceDescription' => 'nullable|string',
            ]);

            $facture = $service->createTurnoverInvoicePhotographer(
                $validated['labelTVA'],
                $validated['issueDate'],
                $validated['dueDate'],
                (int) $validated['idPhotographer'],
                $validated['invoiceTitle'],
                $validated['invoiceDescription'] ?? ''
            );

            $this->logService->logAction($request, 'create_turnover_payment_invoice', 'INVOICE_PAYMENTS', [
                'idPhotographer' => (int) $validated['idPhotographer'],
                'invoice_title' => $validated['invoiceTitle'],
                'invoice_description' => $validated['invoiceDescription'] ?? '',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Facture créée avec succès.',
                'data' => $facture
            ]);

        } catch (\Exception $e) {
            $this->logService->logAction($request, 'create_turnover_payment_invoice_failed', 'INVOICE_PAYMENTS', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur : ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Récupère ID photographe via name
     */
    public function getPhotographerId(Request $request, PennylaneService $service)
    {
        $validated = $request->validate([
            'name' => 'required|string',
        ]);

        $photographerId = $service->getPhotographerIdByName($validated['name']);

        if ($photographerId) {
            $this->logService->logAction($request, 'lookup_photographer_id', 'PHOTOGRAPHERS', [
                'name' => $validated['name'],
                'photographerId' => $photographerId,
            ]);

            return response()->json([
                'success' => true,
                'photographerId' => $photographerId
            ]);
        }

        $this->logService->logAction($request, 'lookup_photographer_id_not_found', 'PHOTOGRAPHERS', [
            'name' => $validated['name'],
        ]);

        return response()->json([
            'success' => false,
            'message' => 'Photographe non trouvé'
        ], 404);
    }

    /**
     * Retourne toutes les factures
     */
    public function getInvoices(PennylaneService $service)
    {
        $invoices = $service->getInvoices();

        return response()->json($invoices);
    }

    /**
     * Retourne factures d’un photographe
     */
    public function getInvoicesByPhotographer($idPhotographer, PennylaneService $service)
    {
        $invoices = $service->getInvoicesByIdPhotographer($idPhotographer);

        return response()->json($invoices);
    }

    /**
     * Récupère un produit d’une facture
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
     * Envoi de mail
     */
    public function sendEmail(Request $request, MailService $mailService)
    {
        $validated = $request->validate([
            'to' => 'required|email',
            'from' => 'required|email',
            'subject' => 'required|string|max:255',
            'body' => 'required|string|max:10000',
        ]);

        try {
            $mailService->sendEmail(
                $validated['to'],
                $validated['from'],
                $validated['subject'],
                $validated['body']
            );

            $this->logService->logAction($request, 'send_email', 'MAIL_LOGS', [
                'to' => $validated['to'],
                'subject' => $validated['subject'],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Email sent successfully.'
            ]);

        } catch (\Exception $e) {
            $this->logService->logAction($request, 'send_email_failed', 'MAIL_LOGS', [
                'to' => $validated['to'],
                'subject' => $validated['subject'],
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to send email: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Téléchargement de facture -> Contournement CORS
     */
    public function downloadInvoice(Request $request)
    {
        $fileUrl = $request->input('file_url');

        if (!$fileUrl) {
            $this->logService->logAction($request, 'download_invoice_proxy_missing_url', 'INVOICE_CREDITS | INVOICE_PAYMENTS', []);
            return response('Aucun fichier spécifié.', 400);
        }

        // Récupérer le contenu du PDF depuis Pennylane
        $fileContent = Http::get($fileUrl)->body(); // utilise HTTP client de Laravel

        // Déterminer le nom du fichier
        $fileName = 'facture.pdf';

        $this->logService->logAction($request, 'download_invoice_proxy', 'INVOICE_CREDITS | INVOICE_PAYMENTS', [
            'file_url' => $fileUrl,
        ]);

        // Retourner le fichier en réponse avec les headers
        return response($fileContent, 200)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'attachment; filename="' . $fileName . '"');
    }

    public function getPhotographers(PennylaneService $service)
    {
        $photographers = $service->getPhotographers();

        $this->logService->logAction(request(), 'list_photographers', 'PHOTOGRAPHERS', [
            'count' => is_countable($photographers) ? count($photographers) : null,
        ]);

        return response()->json([
            $photographers
          ]);
    }
    /**
     * Récupère la liste des photographes
     */
    public function getListPhotographers(PennylaneService $service)
    {
        $photographers = $service->getListPhotographers();

        $this->logService->logAction(request(), 'list_photographers', 'PHOTOGRAPHERS', [
            'count' => is_countable($photographers) ? count($photographers) : null,
        ]);

        return response()->json([
            'success' => true,
            'photographers' => $photographers
        ]);
    }

    public function createClient(Request $request, PennylaneService $service)
    {
        // Déjà validé dans PhotographerController::createPhotographer()
        // Ici on récupère simplement les données sous forme de tableau
        $validated = $request->all();

        try {
            $client = $service->createClient($validated);

            $this->logService->logAction($request, 'create_client', 'PHOTOGRAPHERS', [
                'first_name' => $validated['first_name'] ?? null,
                'last_name' => $validated['last_name'] ?? null,
                'name' => $validated['name'] ?? null,
                'email' => $validated['email'],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Client créé avec succès.',
                'data' => $client
            ]);

        } catch (\Exception $e) {
            $this->logService->logAction($request, 'create_client_failed', 'PHOTOGRAPHERS', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur : ' . $e->getMessage(),
            ], 500);
        }      
    }
    
    public function updateClient(Request $request, PennylaneService $service, $clientId)
    {
        $validated = $request->all();

        try {
            $client = $service->updateClient($clientId, $validated);

            $this->logService->logAction($request, 'update_client', 'PHOTOGRAPHERS', [
                'client_id' => $clientId,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Client mis à jour avec succès.',
                'data' => $client
            ]);

        } catch (\Exception $e) {
            $this->logService->logAction($request, 'update_client_failed', 'PHOTOGRAPHERS', [
                'client_id' => $clientId,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur : ' . $e->getMessage(),
            ], 500);
        }      
    }
}
