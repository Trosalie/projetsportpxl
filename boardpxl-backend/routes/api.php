<?php

use App\Services\PennyLaneService;
use App\Services\MailService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\PennyLaneController;
use App\Http\Controllers\MailController;
use Illuminate\Support\Facades\Mail;

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
});
