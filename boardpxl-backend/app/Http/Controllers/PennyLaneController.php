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
            ]);

            $description = $validated['description'] ?? "";

            $facture = $service->createCreditsInvoicePhotographer(
                $validated['labelTVA'],
                $validated['labelProduct'],
                $description,
                $validated['amountEuro'],
                $validated['issueDate'],
                $validated['dueDate'],
                (int) $validated['idPhotographer'],
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
                'idPhotographer' => 'required|integer',
                'invoiceTitle' => 'required|string',
                'invoiceDescription' => 'string',
            ]);

            $facture = $service->createTurnoverInvoicePhotographer(
                $validated['labelTVA'],
                $validated['amountEuro'],
                $validated['issueDate'],
                $validated['dueDate'],
                (int) $validated['idPhotographer'],
                $validated['invoiceTitle'],
                $validated['invoiceDescription']
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
     * Récupère ID photographe via name
     */
    public function getPhotographerId(Request $request, PennylaneService $service)
    {
        $validated = $request->validate([
            'name' => 'required|string',
        ]);

        $photographerId = $service->getPhotographerIdByName($validated['name']);

        if ($photographerId) {
            return response()->json([
                'success' => true,
                'photographer_id' => $photographerId
            ]);
        }

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
        return response()->json($service->getInvoices());
    }

    /**
     * Retourne factures d’un photographe
     */
    public function getInvoicesByPhotographer($idPhotographer, PennylaneService $service)
    {
        return response()->json($service->getInvoicesByIdPhotographer($idPhotographer));
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
    /**
     * Récupère la liste des photographes
     */
    public function getListPhotographers(PennylaneService $service)
    {
        $photographers = $service->getListPhotographers();

        return response()->json([
            'success' => true,
            'photographers' => $photographers
        ]);
    }

    public function getInvoiceById($id, PennylaneService $service)
    {
        $invoice = $service->getInvoiceById((int)$id);

        if (!$invoice) {
            return response()->json(['message' => 'Facture non trouvée'], 404);
        }

        return response()->json($invoice);
    }
}
