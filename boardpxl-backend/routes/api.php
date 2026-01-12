<?php

use App\Http\Controllers\PhotographerController;
use App\Http\Controllers\InvoiceController;
use App\Services\PennyLaneService;
use App\Services\MailService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\PennyLaneController;
use App\Http\Controllers\MailController;
use App\Models\Photographer;
use Illuminate\Support\Facades\Mail;

// Création d'une facture de crédits pour un client
// Testé : PennyLaneControllerTest::test_create_credits_invoice_client_success et test_create_credits_invoice_client_invalid_client
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\Auth\ResetPasswordController;
use App\Http\Controllers\Auth\VerificationController;
use App\Http\Controllers\Auth\ConfirmPasswordController;

use App\Http\Controllers\LogsController;

/*
|--------------------------------------------------------------------------
| Routes publiques (sans authentification)
|--------------------------------------------------------------------------
*/

// Routes d'authentification publiques
Route::post('/login', [LoginController::class, 'login'])->name('login');
Route::post('/password/email', [ForgotPasswordController::class, 'sendResetLinkEmail']);
Route::post('/password/reset', [ResetPasswordController::class, 'reset']);

// Routes de vérification d'email
Route::get('/email/verify/{id}', [VerificationController::class, 'verify'])->name('verification.verify');
Route::get('/email/resend', [VerificationController::class, 'resend'])->name('verification.resend');

//Récupérer les informations finaciere d'une facture de crédit
Route::get('/invoice-credits-financial-info', [InvoiceController::class, 'getFinancialInfoCreditsInvoice']);

//Récupérer les informations finaciere d'une facture de versement de CA
Route::get('/invoice-turnover-financial-info', [InvoiceController::class, 'getFinancialInfoTurnoverInvoice']);



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
/*
|--------------------------------------------------------------------------
| Routes protégées par Sanctum (nécessitent un token)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum', 'sync.pennylane'])->group(function () {

    // Récupérer toutes les factures Pennylane pour sync
    Route::get('/pennylane-invoices', [PennylaneController::class, 'getInvoices']);

    // Récupérer l'ID d’un client
    Route::post('/client-id', [PennylaneController::class, 'getClientId']);

  // Récupérer les factures de crédit d’un photographe
  // Testé : Non couvert actuellement - test à ajouter (par exemple dans InvoiceControllerTest)
  Route::get('/invoices-credit/{photographer_id}', [InvoiceController::class, 'getInvoicesCreditByPhotographer']);

  // Création d'une facture
  Route::post('/create-credits-invoice-client', [PennylaneController::class, 'createCreditsInvoiceClient']);

  // Création d'une facture de versement de CA
  Route::post('/create-turnover-invoice-client', [PennylaneController::class, 'createTurnoverPaymentInvoice']);

  // Insertion d'une facture de versement de CA
  Route::post('/insert-turnover-invoice', [InvoiceController::class, 'insertTurnoverInvoice']);

  // Insertion d'une facture de crédits
  Route::post('/insert-credits-invoice', [InvoiceController::class, 'insertCreditsInvoice']);


  // Récupérer la liste des clients
  // Testé : PennyLaneControllerTest::test_get_list_clients
  Route::get('/list-clients', [PennylaneController::class, 'getListClients']);

  // Téléchargement contournement CORS
  // Testé : PennyLaneControllerTest::test_download_invoice_success et test_download_invoice_missing_url
  Route::post('/download-invoice', [PennylaneController::class, 'downloadInvoice']);

  // Afficher une facture spécifique
  // Testé : PennyLaneControllerTest::test_get_invoice_by_id_success et test_get_invoice_by_id_not_found
  Route::get('/invoices/{id}', [PennylaneController::class, 'getInvoiceById']);

    // Utilisateur connecté
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Déconnexion
    Route::post('/logout', [LoginController::class, 'logout']);


    // Récupérer les factures de versement d’un photographe
    Route::get('/invoices-payment/{photographer_id}', [InvoiceController::class, 'getInvoicesPaymentByPhotographer']);

    // Récupérer les factures de crédit d’un photographe
    Route::get('/invoices-credit/{photographer_id}', [InvoiceController::class, 'getInvoicesCreditByPhotographer']);
    // Récupérer la liste des clients
    Route::get('/list-clients', [PennylaneController::class, 'getListClients']);
// Envoi de mail
// Testé : MailControllerTest::test_send_email_success
Route::post('/send-email', [MailController::class, 'sendEmail']);

// Test d’envoi mail simple
// Testé : MailControllerTest::test_test_mail
// Confirmation de mot de passe
Route::post('/password/confirm', [ConfirmPasswordController::class, 'confirm']);

// Routes PennyLane (factures)
Route::post('/creation-facture', [PennylaneController::class, 'createInvoice']);
Route::get('/test', [PennylaneController::class, 'getInvoices']);
Route::get('/photographer-ids/{name}', [PhotographerController::class, 'getPhotographerIds']);
Route::get('/invoices-client/{idClient}', [PennylaneController::class, 'getInvoicesByClient']);
Route::get('/invoice-product/{invoiceNumber}', [PennylaneController::class, 'getProductFromInvoice']);
Route::post('/download-invoice', [PennylaneController::class, 'downloadInvoice']);

// Routes Mail
Route::post('/send-email', [MailController::class, 'sendEmail']);
Route::get('/test-mail', [MailController::class, 'testMail']);
Route::get('/mail-logs/{sender_id}', [MailController::class, 'getLogs']);

    // Téléchargement contournement CORS
    Route::post('/download-invoice', [PennylaneController::class, 'downloadInvoice']);

    // Afficher une facture spécifique
    Route::get('/invoices/{id}', [InvoiceController::class, 'getInvoiceById']);

    // Récupérer les factures d'un client
    Route::get('/invoices-client/{idClient}', [InvoiceController::class, 'getInvoicesByClient']);

    // Récupérer un produit d'une facture
    Route::get('/invoice-product/{invoiceNumber}', [InvoiceController::class, 'getProductFromInvoice']);

    // Confirmation de mot de passe
    Route::post('/password/confirm', [ConfirmPasswordController::class, 'confirm']);

    // Routes Mail
    Route::post('/send-email', [MailController::class, 'sendEmail']);
    Route::get('/test-mail', [MailController::class, 'testMail']);

    // Récupérer tous les clients
    Route::get('/photographers', [PhotographerController::class, 'getPhotographers']);

//un client
Route::get('photographer/{id}', [PhotographerController::class, 'getPhotographer']);

// Logs
Route::get('/logs', [LogsController::class, 'getLogs']);
});
