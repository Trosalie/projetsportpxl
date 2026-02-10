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
Route::post('/login', [LoginController::class, 'login'])->name('login'); // rate limiter appliqué dans le middleware
Route::post('/password/email', [ForgotPasswordController::class, 'sendResetLinkEmail']);
Route::post('/password/reset', [ResetPasswordController::class, 'reset']);

// Routes de vérification d'email
Route::get('/email/verify/{id}', [VerificationController::class, 'verify'])->name('verification.verify');
Route::get('/email/resend', [VerificationController::class, 'resend'])->name('verification.resend');

/*
|--------------------------------------------------------------------------
| Routes protégées par Sanctum (nécessitent un token)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum'])->group(function () {

    // Récupérer toutes les factures Pennylane pour sync
    Route::get('/pennylane-invoices', [PennylaneController::class, 'getInvoices']);

    // Récupérer l'ID d’un photographe
    Route::post('/photographer-id', [PennylaneController::class, 'getPhotographerId']);

    // Récupérer les factures de crédit d’un photographe
    // Testé : Non couvert actuellement - test à ajouter (par exemple dans InvoiceControllerTest)
    Route::get('/invoices-credit/{photographer_id}', [InvoiceController::class, 'getInvoicesCreditByPhotographer']);
    // Récupérer les factures de plusieurs photographes en une seule requête (optimisation)
    Route::post('/invoices-bulk', [InvoiceController::class, 'getBulkInvoicesByPhotographers']);
    // Création d'une facture
    Route::post('/create-credits-invoice-photographer', [PennylaneController::class, 'createCreditsInvoicePhotographer']);

    // Création d'une facture de versement de CA
    Route::post('/create-turnover-invoice-photographer', [PennylaneController::class, 'createTurnoverPaymentInvoice']);

    // Insertion d'une facture de versement de CA
    Route::post('/insert-turnover-invoice', [InvoiceController::class, 'insertTurnoverInvoice']);

    // Insertion d'une facture de crédits
    Route::post('/insert-credits-invoice', [InvoiceController::class, 'insertCreditsInvoice']);


    // Récupérer la liste des photographes
    // Testé : PennyLaneControllerTest::test_get_list_photogrpahers
    Route::get('/list-photographers', [PennylaneController::class, 'getListPhotographers']);
    //Récupérer les informations finaciere d'une facture de crédit
    Route::get('/invoice-credits-financial-info', [InvoiceController::class, 'getFinancialInfoCreditsInvoice']);

    //Récupérer les informations finaciere d'une facture de versement de CA
    Route::get('/invoice-turnover-financial-info', [InvoiceController::class, 'getFinancialInfoTurnoverInvoice']);
    // Création d'une facture
    Route::post('/create-credits-invoice-photographer', [PennylaneController::class, 'createCreditsInvoicePhotographer']);

    // Afficher une facture spécifique
    // Testé : InvoiceAndPhotographerControllerTest::test_get_invoice_by_id_success et test_get_invoice_by_id_not_found
    Route::get('/invoices/{id}', [InvoiceController::class, 'getInvoiceById']);

    // Utilisateur connecté
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Déconnexion
    Route::post('/logout', [LoginController::class, 'logout']);


    // Récupérer les factures de versement d’un photographe
    Route::get('/invoices-payment/{photographer_id}', [InvoiceController::class, 'getInvoicesPaymentByPhotographer']);


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
    Route::get('/invoice-product/{invoiceNumber}', [PennylaneController::class, 'getProductFromInvoice']);
    Route::post('/download-invoice', [PennylaneController::class, 'downloadInvoice']);

    Route::get('/invoices-photographer/{idPhotographer}', [InvoiceController::class, 'getInvoicesByPhotographer']);

    // Routes Mail
    Route::post('/send-email', [MailController::class, 'sendEmail']);
    Route::get('/test-mail', [MailController::class, 'testMail']);
    Route::get('/mail-logs/{sender_id}', [MailController::class, 'getLogs']);

    // Récupérer tous les photographes
    Route::get('/photographers', [PhotographerController::class, 'getPhotographers']);

    //un photographe
    Route::get('photographer/{id}', [PhotographerController::class, 'getPhotographer']);

    // Logs
    Route::get('/logs', [LogsController::class, 'getLogs']);

    //Récupérer les informations finaciere d'une facture de crédit
    Route::get('/invoice-credits-financial-info', [InvoiceController::class, 'getFinancialInfoCreditsInvoice']);

    //Récupérer les informations finaciere d'une facture de versement de CA
    Route::get('/invoice-turnover-financial-info', [InvoiceController::class, 'getFinancialInfoTurnoverInvoice']);

});
