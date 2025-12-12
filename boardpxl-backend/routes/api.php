<?php

use App\Http\Controllers\InvoiceController;
use App\Services\PennyLaneService;
use App\Services\MailService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PennyLaneController;
use App\Http\Controllers\MailController;
use App\Models\Photographer;
use Illuminate\Support\Facades\Mail;
use App\Http\Controllers\PhotographerController;



// Création d'une facture
Route::post('/create-credits-invoice-client', [PennylaneController::class, 'createCreditsInvoiceClient']);

// Création d'une facture de versement de CA
Route::post('/create-turnover-invoice-client', [PennylaneController::class, 'createTurnoverPaymentInvoice']);

// Insertion d'une facture de versement de CA
Route::post('/insert-turnover-invoice', [InvoiceController::class, 'insertTurnoverInvoice']);

// Insertion d'une facture de crédits
Route::post('/insert-credits-invoice', [InvoiceController::class, 'insertCreditsInvoice']);

// Tester récupération globale
Route::get('/test', [PennylaneController::class, 'getInvoices']);

// Récupérer l'ID d’un client
Route::post('/client-id', [PennylaneController::class, 'getClientId']);

// Récupérer toutes les factures d’un client
Route::get('/invoices-client/{idClient}', [PennylaneController::class, 'getInvoicesByClient']);

// Récupérer un produit d’une facture
Route::get('/invoice-product/{invoiceNumber}', [PennylaneController::class, 'getProductFromInvoice']);

// Récupérer les factures de versement d’un photographe
Route::get('/invoices-payment/{photographer_id}', [InvoiceController::class, 'getInvoicesPaymentByPhotographer']);

// Récupérer les factures de crédit d’un photographe
Route::get('/invoices-credit/{photographer_id}', [InvoiceController::class, 'getInvoicesCreditByPhotographer']);
// Récupérer la liste des clients
Route::get('/list-clients', [PennylaneController::class, 'getListClients']);

// Téléchargement contournement CORS
Route::post('/download-invoice', [PennylaneController::class, 'downloadInvoice']);

// Afficher une facture spécifique
Route::get('/invoices/{id}', [PennylaneController::class, 'getInvoiceById']);



// Envoi de mail
Route::post('/send-email', [MailController::class, 'sendEmail']);

// Test d’envoi mail simple
Route::get('/test-mail', [MailController::class, 'testMail']);

// Récupérer tous les clients
Route::get('/photographers', [PhotographerController::class, 'getPhotographers']);

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});


