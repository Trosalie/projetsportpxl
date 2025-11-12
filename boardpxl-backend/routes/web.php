<?php

use Illuminate\Support\Facades\Route;
use App\Services\PennylaneService;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});



Route::get('/test-pennylane', function (PennylaneService $service) {
    $invoices = $service->getInvoices();
    return response()->json($invoices);
});

Route::get('/invoices-client/{idClient}', function ($idClient, PennylaneService $service) {
    $invoices = $service->getFacturesParIdClient($idClient);
    return response()->json($invoices);
});

