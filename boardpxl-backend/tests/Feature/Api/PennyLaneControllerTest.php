<?php

namespace Tests\Feature\Api;

use App\Http\Controllers\PennyLaneController;
use App\Services\PennylaneService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use Mockery;

class PennyLaneControllerTest extends TestCase
{

    // Test de création réussie d'une facture de crédits pour un client
    public function test_create_credits_invoice_client_success()
    {
        // Mock du service Pennylane
        $mock = Mockery::mock(PennylaneService::class);
        $mock->shouldReceive('createCreditsInvoiceClient')
            ->once()
            ->andReturn([
                'id' => 999,
                'status' => 'created'
            ]);

        // Injection du mock dans le container Laravel
        $this->app->instance(PennylaneService::class, $mock);

        // Appel HTTP de la route API
        $response = $this->postJson('/api/create-credits-invoice-client', [
            'labelTVA'      => 'FR_200',
            'labelProduct'  => '40 000 crédits',
            'amountEuro'    => '100',
            'issueDate'     => now()->toDateString(), 
            'dueDate'       => now()->addDays(30)->toDateString(), 
            'idClient'      => 208474147,
            'invoiceTitle'  => 'Facture crédits'
        ]);

        // Vérifications
        $response
            ->assertStatus(200)
            ->assertJson([
                'success' => true
            ]);
    }


    // Test de gestion d'erreur lors de la création d'une facture de crédits pour un client invalide
    public function test_create_credits_invoice_client_invalid_client()
    {
        $mock = Mockery::mock(PennylaneService::class);
        $mock->shouldReceive('createCreditsInvoiceClient')
            ->once()
            ->andThrow(new \Exception('Client introuvable'));

        $this->app->instance(PennylaneService::class, $mock);

        $response = $this->postJson('/api/create-credits-invoice-client', [
            'labelTVA'      => 'FR_200',
            'labelProduct'  => '40 000 crédits',
            'amountEuro'    => '100',
            'issueDate'     => now()->toDateString(), 
            'dueDate'       => now()->addDays(30)->toDateString(), 
            'idClient'      => 0,
            'invoiceTitle'  => 'Facture crédits'
        ]);

        $response->assertStatus(500)
                ->assertJson([
                    'success' => false,
                    'message' => 'Erreur : Client introuvable'
                ]);
    }
}
