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



// Création d'une facture
Route::post('/creation-facture', [PennylaneController::class, 'createInvoice']);

// Tester récupération globale
Route::get('/test', [PennylaneController::class, 'getInvoices']);

// Récupérer l'ID d’un client
Route::get('/client-id', [PennylaneController::class, 'getClientId']);

// Récupérer toutes les factures d’un client
Route::get('/invoices-client/{idClient}', [PennylaneController::class, 'getInvoicesByClient']);

// Récupérer un produit d’une facture
Route::get('/invoice-product/{invoiceNumber}', [PennylaneController::class, 'getProductFromInvoice']);

// Téléchargement contournement CORS
Route::post('/download-invoice', [PennylaneController::class, 'downloadInvoice']);


// Envoi de mail
Route::post('/send-email', [MailController::class, 'sendEmail']);

// Test d’envoi mail simple
Route::get('/test-mail', [MailController::class, 'testMail']);

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('/login', [LoginController::class, 'login']);
Route::post('logout', [LoginController::class, 'logout']);

//Route::post('register', [RegisterController::class, 'register']);

Route::post('password/email', [ForgotPasswordController::class, 'sendResetLinkEmail']);

Route::post('password/reset', [ResetPasswordController::class, 'reset']);

//Route::get('email/verify', [VerificationController::class, 'show'])->name('verification.notice');
Route::get('email/verify/{id}', [VerificationController::class, 'verify'])->name('verification.verify');
Route::get('email/resend', [VerificationController::class, 'resend'])->name('verification.resend');

Route::post('password/confirm', [ConfirmPasswordController::class, 'confirm']);

Route::post('password/reset', [ResetPasswordController::class, 'reset']);
