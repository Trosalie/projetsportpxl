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



// Création d'une facture de crédits pour un client
// Testé : PennyLaneControllerTest::test_create_credits_invoice_client_success et test_create_credits_invoice_client_invalid_client
Route::post('/create-credits-invoice-client', [PennylaneController::class, 'createCreditsInvoiceClient']);

// Création d'une facture de versement de CA pour un client
// Testé : PennyLaneControllerTest::test_create_turnover_payment_invoice_success et test_create_turnover_payment_invoice_error
Route::post('/create-turnover-invoice-client', [PennylaneController::class, 'createTurnoverPaymentInvoice']);

// Insertion d'une facture de versement de CA
Route::post('/insert-turnover-invoice', [InvoiceController::class, 'insertTurnoverInvoice']);

// Insertion d'une facture de crédits
Route::post('/insert-credits-invoice', [InvoiceController::class, 'insertCreditsInvoice']);

// Tester récupération globale
// Testé : PennyLaneControllerTest::test_get_invoices
Route::get('/test', [PennylaneController::class, 'getInvoices']);

// Récupérer l'ID d’un client
// Testé : PennyLaneControllerTest::test_get_client_id_success et test_get_client_id_not_found
Route::post('/client-id', [PennylaneController::class, 'getClientId']);

// Récupérer toutes les factures d’un client
// Testé : PennyLaneControllerTest::test_get_invoices_by_client
Route::get('/invoices-client/{idClient}', [PennylaneController::class, 'getInvoicesByClient']);

// Récupérer un produit d’une facture
// Testé : PennyLaneControllerTest::test_get_product_from_invoice_success et test_get_product_from_invoice_not_found
Route::get('/invoice-product/{invoiceNumber}', [PennylaneController::class, 'getProductFromInvoice']);

// Récupérer les factures de versement d’un photographe
Route::get('/invoices-payment/{photographer_id}', [InvoiceController::class, 'getInvoicesPaymentByPhotographer']);

// Récupérer les factures de crédit d’un photographe
Route::get('/invoices-credit/{photographer_id}', [InvoiceController::class, 'getInvoicesCreditByPhotographer']);

// Récupérer la liste des clients
// Testé : PennyLaneControllerTest::test_get_list_clients
Route::get('/list-clients', [PennylaneController::class, 'getListClients']);

// Téléchargement contournement CORS
// Testé : PennyLaneControllerTest::test_download_invoice_success et test_download_invoice_missing_url
Route::post('/download-invoice', [PennylaneController::class, 'downloadInvoice']);

// Afficher une facture spécifique
// Testé : PennyLaneControllerTest::test_get_invoice_by_id_success et test_get_invoice_by_id_not_found
Route::get('/invoices/{id}', [PennylaneController::class, 'getInvoiceById']);



// Envoi de mail
// Testé : MailControllerTest::test_send_email_success
Route::post('/send-email', [MailController::class, 'sendEmail']);

// Test d’envoi mail simple
// Testé : MailControllerTest::test_test_mail
Route::get('/test-mail', [MailController::class, 'testMail']);

// Récupérer tous les clients
Route::get('/photographers', [PhotographerController::class, 'getPhotographers']);

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});


