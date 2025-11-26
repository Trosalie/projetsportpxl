<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;
use App\Services\PennylaneService;
use App\Services\MailService;
use Illuminate\Support\Facades\Mail;

class PennyLaneController extends Controller
{
    /**
     * Création d'une facture Pennylane
     */
    public function createInvoice(Request $request, PennylaneService $service)
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

            $facture = $service->createInvoiceClient(
                $validated['labelTVA'],
                $validated['labelProduct'],
                $description,
                $validated['amountEuro'],
                $validated['issueDate'],
                $validated['dueDate'],
                (int) $validated['idClient'],
                $validated['invoiceTitle']
            );

            return response()->json([
                'success' => true,
                'message' => 'Facture créée avec succès.',
                'data' => $facture
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur : ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Récupère ID client via prénom + nom
     */
    public function getClientId(Request $request, PennylaneService $service)
    {
        $validated = $request->validate([
            'prenom' => 'required|string',
            'nom' => 'required|string',
        ]);

        $clientId = $service->getClientIdByName($validated['prenom'], $validated['nom']);

        if ($clientId) {
            return response()->json([
                'success' => true,
                'client_id' => $clientId
            ]);
        }

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
        return response()->json($service->getInvoices());
    }

    /**
     * Retourne factures d’un client
     */
    public function getInvoicesByClient($idClient, PennylaneService $service)
    {
        return response()->json($service->getInvoicesByIdClient($idClient));
    }

    /**
     * Récupère un produit d’une facture
     */
    public function getProductFromInvoice($invoiceNumber, PennylaneService $service)
    {
        $product = $service->getProductFromInvoice($invoiceNumber);

        if ($product) {
            return response()->json([
                'success' => true,
                'product' => $product
            ]);
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

            return response()->json([
                'success' => true,
                'message' => 'Email sent successfully.'
            ]);

        } catch (\Exception $e) {
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
            return response('Aucun fichier spécifié.', 400);
        }

        // Récupérer le contenu du PDF depuis Pennylane
        $fileContent = Http::get($fileUrl)->body(); // utilise HTTP client de Laravel

        // Déterminer le nom du fichier
        $fileName = 'facture.pdf';

        // Retourner le fichier en réponse avec les headers
        return response($fileContent, 200)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'attachment; filename="' . $fileName . '"');
    }

    public function getPhotographers(PennylaneService $service)
    {
        $photographers = $service->getPhotographers();

        return response()->json([
            $photographers
        ]);
    }
}
