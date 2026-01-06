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

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\Auth\ResetPasswordController;
use App\Http\Controllers\Auth\VerificationController;
use App\Http\Controllers\Auth\ConfirmPasswordController;

/*
|--------------------------------------------------------------------------
| Routes publiques (sans authentification)
|--------------------------------------------------------------------------
*/

// Routes d'authentification publiques
Route::post('/login', [LoginController::class, 'login']);
Route::post('/password/email', [ForgotPasswordController::class, 'sendResetLinkEmail']);
Route::post('/password/reset', [ResetPasswordController::class, 'reset']);

// Routes de vérification d'email
Route::get('/email/verify/{id}', [VerificationController::class, 'verify'])->name('verification.verify');
Route::get('/email/resend', [VerificationController::class, 'resend'])->name('verification.resend');
// Création d'une facture
Route::post('/create-credits-invoice-client', [PennylaneController::class, 'createCreditsInvoiceClient']);

// Création d'une facture de versement de CA
Route::post('/create-turnover-invoice-client', [PennylaneController::class, 'createTurnoverPaymentInvoice']);

// Insertion d'une facture de versement de CA
Route::post('/insert-turnover-invoice', [InvoiceController::class, 'insertTurnoverInvoice']);

// Insertion d'une facture de crédits
Route::post('/insert-credits-invoice', [InvoiceController::class, 'insertCreditsInvoice']);

//Récupérer les informations finaciere d'une facture de crédit
Route::get('/invoice-credits-financial-info', [InvoiceController::class, 'getFinancialInfoCreditsInvoice']);

//Récupérer les informations finaciere d'une facture de versement de CA
Route::get('/invoice-turnover-financial-info', [InvoiceController::class, 'getFinancialInfoTurnoverInvoice']);



// Tester récupération globale
Route::get('/test', [PennylaneController::class, 'getInvoices']);

// Récupérer l'ID d’un client
Route::post('/client-id', [PennylaneController::class, 'getClientId']);

/*
|--------------------------------------------------------------------------
| Routes protégées par Sanctum (nécessitent un token)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

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

// Téléchargement contournement CORS
Route::post('/download-invoice', [PennylaneController::class, 'downloadInvoice']);

// Afficher une facture spécifique
Route::get('/invoices/{id}', [PennylaneController::class, 'getInvoiceById']);



// Confirmation de mot de passe
Route::post('/password/confirm', [ConfirmPasswordController::class, 'confirm']);

// Routes PennyLane (factures)
Route::post('/creation-facture', [PennylaneController::class, 'createInvoice']);
Route::get('/test', [PennylaneController::class, 'getInvoices']);
Route::get('/client-id', [PennylaneController::class, 'getClientId']);
Route::get('/invoices-client/{idClient}', [PennylaneController::class, 'getInvoicesByClient']);
Route::get('/invoice-product/{invoiceNumber}', [PennylaneController::class, 'getProductFromInvoice']);
Route::post('/download-invoice', [PennylaneController::class, 'downloadInvoice']);

// Routes Mail
Route::post('/send-email', [MailController::class, 'sendEmail']);
Route::get('/test-mail', [MailController::class, 'testMail']);

// Récupérer tous les clients
Route::get('/photographers', [PhotographerController::class, 'getPhotographers']);

});

