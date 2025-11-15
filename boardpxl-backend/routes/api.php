<?php

use App\Services\PennylaneService;
use App\Services\MailService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Mail;

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

// Envoi de mail
Route::post('/send-email', function (Request $request, MailService $mailService) {
    $validated = $request->validate([
        'to' => 'required|email',
        'from' => 'required|email',
        'subject' => 'required|string|max:255',
        'body' => 'required|string|max:10000',
    ]);

    try {
        $mailService->sendEmail($validated['to'], $validated['from'], $validated['subject'], $validated['body']);
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
});

Route::get('/test-mail', function () {
    Mail::raw('Test Mailpit depuis Docker 📨', function ($message) {
        $message->to('test@example.com')
                ->subject('Hello from Mailpit');
    });

    if (Mail::failures()) {
        return json_encode(['message' => 'Échec de l\'envoi du mail.']);
    }
    return json_encode(['message' => 'Mail envoyé (si tout va bien) !']);
});

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});