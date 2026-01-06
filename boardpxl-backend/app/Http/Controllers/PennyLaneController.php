<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;
use App\Services\PennylaneService;
use App\Services\MailService;
use Illuminate\Support\Facades\Mail;
use App\Models\Logs;
use Illuminate\Support\Facades\Auth;

class PennyLaneController extends Controller
{
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

            $this->logAction($request, 'create_credits_invoice_client', 'pennylane_invoices', [
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
            $this->logAction($request, 'create_credits_invoice_client_failed', 'pennylane_invoices', [
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
                'amountEuro' => 'required|string',
                'issueDate' => 'required|string',
                'dueDate' => 'required|string',
                'idClient' => 'required|integer',
                'invoiceTitle' => 'required|string',
                'invoiceDescription' => 'string',
            ]);

            $facture = $service->createTurnoverInvoiceClient(
                $validated['labelTVA'],
                $validated['amountEuro'],
                $validated['issueDate'],
                $validated['dueDate'],
                (int) $validated['idClient'],
                $validated['invoiceTitle'],
                $validated['invoiceDescription']
            );

            $this->logAction($request, 'create_turnover_payment_invoice', 'pennylane_invoices', [
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
            $this->logAction($request, 'create_turnover_payment_invoice_failed', 'pennylane_invoices', [
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
            $this->logAction($request, 'lookup_client_id', 'pennylane_clients', [
                'name' => $validated['name'],
                'client_id' => $clientId,
            ]);

            return response()->json([
                'success' => true,
                'client_id' => $clientId
            ]);
        }

        $this->logAction($request, 'lookup_client_id_not_found', 'pennylane_clients', [
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

        $this->logAction(request(), 'list_invoices', 'pennylane_invoices', [
            'count' => is_countable($invoices) ? count($invoices) : null,
        ]);

        return response()->json($invoices);
    }

    /**
     * Retourne factures d’un client
     */
    public function getInvoicesByClient($idClient, PennylaneService $service)
    {
        $invoices = $service->getInvoicesByIdClient($idClient);

        $this->logAction(request(), 'list_invoices_by_client', 'pennylane_invoices', [
            'id_client' => (int) $idClient,
            'count' => is_countable($invoices) ? count($invoices) : null,
        ]);

        return response()->json($invoices);
    }

    /**
     * Récupère un produit d’une facture
     */
    public function getProductFromInvoice($invoiceNumber, PennylaneService $service)
    {
        $product = $service->getProductFromInvoice($invoiceNumber);

        if ($product) {
            $this->logAction(request(), 'get_product_from_invoice', 'pennylane_invoices', [
                'invoice_number' => $invoiceNumber,
            ]);
            return response()->json($product);
        }

        $this->logAction(request(), 'get_product_from_invoice_not_found', 'pennylane_invoices', [
            'invoice_number' => $invoiceNumber,
        ]);

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

            $this->logAction($request, 'send_email', 'pennylane_mail', [
                'to' => $validated['to'],
                'subject' => $validated['subject'],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Email sent successfully.'
            ]);

        } catch (\Exception $e) {
            $this->logAction($request, 'send_email_failed', 'pennylane_mail', [
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
            $this->logAction($request, 'download_invoice_proxy_missing_url', 'pennylane_invoices');
            return response('Aucun fichier spécifié.', 400);
        }

        // Récupérer le contenu du PDF depuis Pennylane
        $fileContent = Http::get($fileUrl)->body(); // utilise HTTP client de Laravel

        // Déterminer le nom du fichier
        $fileName = 'facture.pdf';

        $this->logAction($request, 'download_invoice_proxy', 'pennylane_invoices', [
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

        $this->logAction(request(), 'list_photographers', 'photographers', [
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

        $this->logAction(request(), 'list_clients', 'pennylane_clients', [
            'count' => is_countable($clients) ? count($clients) : null,
        ]);

        return response()->json([
            'success' => true,
            'clients' => $clients
        ]);
    }

    public function getInvoiceById($id, PennylaneService $service)
    {
        $invoice = $service->getInvoiceById((int)$id);

        if (!$invoice) {
            $this->logAction(request(), 'get_invoice_by_id_not_found', 'pennylane_invoices', [
                'invoice_id' => (int) $id,
            ]);
            return response()->json(['message' => 'Facture non trouvée'], 404);
        }

        $this->logAction(request(), 'get_invoice_by_id', 'pennylane_invoices', [
            'invoice_id' => (int) $id,
        ]);

        return response()->json($invoice);
    }

    private function logAction(Request $request, string $action, ?string $tableName = null, array $details = []): void
    {
        $userId = Auth::id() ?? optional($request->user())->id;

        if (!$userId) {
            return;
        }

        Logs::create([
            'action' => $action,
            'user_id' => $userId,
            'table_name' => $tableName,
            'ip_address' => $request->ip(),
            'details' => $details ? json_encode($details) : null,
        ]);
    }
}
