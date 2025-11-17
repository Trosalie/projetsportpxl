<?php

use App\Services\PennylaneService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\InvoiceController;

// Création d'une facture pour un client
Route::post('/pennylane/creation-facture', function (Request $request, PennylaneService $service) {
    try {
        // Récupération des données envoyées
        $validated = $request->validate([
            'labelTVA' => 'required|string',
            'labelProduct' => 'required|string',
            'description' => 'nullable|string',
            'amountEuro' => 'required|numeric',
            'issueDate' => 'required|date',
            'dueDate' => 'required|date',
            'idClient' => 'required|integer',
            'invoiceTitle' => 'required|string',
        ]);

        $description = $validated['description'] ?? "";

        // Appel du service
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

        // Réponse JSON
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
});

// Récupérer l'ID client par nom et prénom
Route::get('/pennylane/client-id', function (Request $request, PennylaneService $service) {
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
});

// Test route to get all invoices
Route::get('/test-pennylane', function (PennylaneService $service) {
    $invoices = $service->getInvoices();
    return response()->json($invoices);
});

// Récupérer les factures d'un client par son ID
Route::get('/invoices-client/{idClient}', function ($idClient, PennylaneService $service) {
    $invoices = $service->getInvoicesByIdClient($idClient);
    return response()->json($invoices);
});


Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Route téléchargement facture
Route::post('/download-invoice', [InvoiceController::class, 'download']);