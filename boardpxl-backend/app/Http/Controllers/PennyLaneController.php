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
    public function createCreditsInvoiceClient(Request $request, PennylaneService $service)
    {
        try {
            $validated = $request->validate([
                'labelTVA' => 'required|string',
                'labelProduct' => 'required|string',
                'description' => 'nullable|string',
                'amountEuro' => 'required|string',
                'issueDate' => 'required|string',
                'dueDate' => 'required|string',
                'idClient' => 'required|integer',
                'invoiceTitle' => 'required|string',
            ]);

            $description = $validated['description'] ?? "";

            $facture = $service->createCreditsInvoiceClient(
                $validated['labelTVA'],
                $validated['labelProduct'],
                $description,
                $validated['amountEuro'],
                $validated['issueDate'],
                $validated['dueDate'],
                (int) $validated['idClient'],
                $validated['invoiceTitle']
            );

            $this->logService->logAction($request, 'create_credits_invoice_client', 'INVOICE_CREDITS', [
                'id_client' => (int) $validated['idClient'],
                'invoice_title' => $validated['invoiceTitle'],
                'amount_euro' => $validated['amountEuro'],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Facture créée avec succès.',
                'data' => $facture
            ]);

        } catch (\Exception $e) {
            $this->logService->logAction($request, 'create_credits_invoice_client_failed', 'INVOICE_CREDITS', [
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
                'idClient' => 'required|integer',
                'invoiceTitle' => 'required|string',
                'invoiceDescription' => 'required|string',
            ]);

            $facture = $service->createTurnoverInvoiceClient(
                $validated['labelTVA'],
                $validated['issueDate'],
                $validated['dueDate'],
                (int) $validated['idClient'],
                $validated['invoiceTitle'],
                $validated['invoiceDescription']
            );

            $this->logService->logAction($request, 'create_turnover_payment_invoice', 'INVOICE_PAYMENTS', [
                'id_client' => (int) $validated['idClient'],
                'invoice_title' => $validated['invoiceTitle'],
                'invoice_description' => $validated['invoiceDescription'],
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
     * Récupère ID client via name
     */
    public function getClientId(Request $request, PennylaneService $service)
    {
        $validated = $request->validate([
            'name' => 'required|string',
        ]);

        $clientId = $service->getClientIdByName($validated['name']);

        if ($clientId) {
            $this->logService->logAction($request, 'lookup_client_id', 'PHOTOGRAPHERS', [
                'name' => $validated['name'],
                'client_id' => $clientId,
            ]);

            return response()->json([
                'success' => true,
                'client_id' => $clientId
            ]);
        }

        $this->logService->logAction($request, 'lookup_client_id_not_found', 'PHOTOGRAPHERS', [
            'name' => $validated['name'],
        ]);

        return response()->json([
            'success' => false,
            'message' => 'Client non trouvé'
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
     * Retourne factures d’un client
     */
    public function getInvoicesByClient($idClient, PennylaneService $service)
    {
        $invoices = $service->getInvoicesByIdClient($idClient);

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
     * Récupère la liste des clients
     */
    public function getListClients(PennylaneService $service)
    {
        $clients = $service->getListClients();

        $this->logService->logAction(request(), 'list_clients', 'PHOTOGRAPHERS', [
            'count' => is_countable($clients) ? count($clients) : null,
        ]);

        return response()->json([
            'success' => true,
            'clients' => $clients
        ]);
    }
}
