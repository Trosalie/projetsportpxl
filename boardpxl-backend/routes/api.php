<?php

use App\Services\PennylaneService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/pennylane/creation-facture', function (Request $request, PennylaneService $service) {
    try {
        // Récupération des données envoyées
        $validated = $request->validate([
            'labelTVA' => 'required|string',
            'labelProduit' => 'required|string',
            'description' => 'nullable|string',
            'montantEuro' => 'required|numeric',
            'dateEmission' => 'required|date',
            'dateLimite' => 'required|date',
            'idClient' => 'required|integer',
            'titreFacture' => 'required|string',
        ]);

        $description = $validated['description'] ?? "";

        // Appel du service
        $facture = $service->creationFactureClient(
            $validated['labelTVA'],
            $validated['labelProduit'],
            $description,
            $validated['montantEuro'],
            $validated['dateEmission'],
            $validated['dateLimite'],
            (int) $validated['idClient'],
            $validated['titreFacture']
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


Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
