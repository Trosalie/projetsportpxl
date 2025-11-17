<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\Auth\ResetPasswordController;
use App\Http\Controllers\Auth\VerificationController;
use App\Http\Controllers\Auth\ConfirmPasswordController;


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return response()->json($request->user());
});

Route::post('login', [LoginController::class, 'login']);
Route::post('logout', [LoginController::class, 'logout']);

Route::post('register', [RegisterController::class, 'register']);

Route::post('password/email', [ForgotPasswordController::class, 'sendResetLinkEmail']);

Route::post('password/reset', [ResetPasswordController::class, 'reset']);

//Route::get('email/verify', [VerificationController::class, 'show'])->name('verification.notice');
Route::get('email/verify/{id}', [VerificationController::class, 'verify'])->name('verification.verify');
Route::get('email/resend', [VerificationController::class, 'resend'])->name('verification.resend');

Route::post('password/confirm', [ConfirmPasswordController::class, 'confirm']);

Route::post('password/reset', [ResetPasswordController::class, 'reset']);
