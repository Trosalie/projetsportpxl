<?php

namespace Tests\Feature\Api;

use Illuminate\Foundation\Testing\WithoutMiddleware;
use App\Http\Controllers\PennyLaneController;
use App\Services\PennylaneService;
use Tests\TestCase;
use Mockery;
use Illuminate\Support\Facades\DB;

class PennyLaneControllerTest extends TestCase
{
    use WithoutMiddleware;

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
    // Ce test vérifie la création réussie d'une facture de crédits pour un client.
    // Il simule un appel au service PennyLane qui retourne une facture créée avec succès.
    // La requête POST contient les paramètres nécessaires comme labelTVA, amountEuro, etc.
    // On s'attend à une réponse HTTP 200 avec un JSON indiquant le succès.
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


    // Ce test vérifie la gestion d'une erreur lors de la création d'une facture de crédits pour un client invalide.
    // Le service PennyLane lance une exception 'Client introuvable', et on s'attend à une réponse 500 avec un message d'erreur.
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

    // Ce test vérifie la création réussie d'une facture de versement de CA pour un client.
    // Il simule un appel réussi au service PennyLane et vérifie la réponse positive.
    public function test_create_turnover_payment_invoice_success()
    {
        $mock = Mockery::mock(PennylaneService::class);
        $mock->shouldReceive('createTurnoverInvoiceClient')
            ->once()
            ->andReturn([
                'id' => 1000,
                'status' => 'created'
            ]);

        $this->app->instance(PennylaneService::class, $mock);

        $response = $this->postJson('/api/create-turnover-invoice-client', [
            'labelTVA' => 'FR_200',
            'amountEuro' => '500',
            'issueDate' => now()->toDateString(),
            'dueDate' => now()->addDays(30)->toDateString(),
            'idClient' => 208474147,
            'invoiceTitle' => 'Facture versement CA',
            'invoiceDescription' => 'Description de la facture'
        ]);

        $response
            ->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Facture créée avec succès.'
            ]);
    }

    // Ce test vérifie la gestion d'une erreur lors de la création d'une facture de versement de CA.
    // Le service lance une exception, et on s'attend à une réponse 500 avec le message d'erreur.
    public function test_create_turnover_payment_invoice_error()
    {
        $mock = Mockery::mock(PennylaneService::class);
        $mock->shouldReceive('createTurnoverInvoiceClient')
            ->once()
            ->andThrow(new \Exception('Erreur lors de la création'));

        $this->app->instance(PennylaneService::class, $mock);

        $response = $this->postJson('/api/create-turnover-invoice-client', [
            'labelTVA' => 'FR_200',
            'amountEuro' => '500',
            'issueDate' => now()->toDateString(),
            'dueDate' => now()->addDays(30)->toDateString(),
            'idClient' => 208474147,
            'invoiceTitle' => 'Facture versement CA',
            'invoiceDescription' => 'Description de la facture'
        ]);

        $response->assertStatus(500)
                ->assertJson([
                    'success' => false,
                    'message' => 'Erreur : Erreur lors de la création'
                ]);
    }

    // Ce test vérifie la récupération de toutes les factures via la route /test.
    // Il simule le service retournant une liste de factures et vérifie que la réponse contient ces données.
    public function test_get_invoices()
    {
        $mock = Mockery::mock(PennylaneService::class);
        $mock->shouldReceive('getInvoices')
            ->once()
            ->andReturn([
                ['id' => 1, 'invoice_number' => 'INV-001'],
                ['id' => 2, 'invoice_number' => 'INV-002']
            ]);

        $this->app->instance(PennylaneService::class, $mock);

        $response = $this->getJson('/api/test');

        $response->assertStatus(200)
                ->assertJson([
                    ['id' => 1, 'invoice_number' => 'INV-001'],
                    ['id' => 2, 'invoice_number' => 'INV-002']
                ]);
    }

    // Ce test vérifie la récupération réussie de l'ID d'un client par son nom.
    // Le service retourne un ID valide, et la réponse confirme le succès avec l'ID.
    public function test_get_client_id_success()
    {
        $mock = Mockery::mock(PennylaneService::class);
        $mock->shouldReceive('getClientIdByName')
            ->with('John Doe')
            ->once()
            ->andReturn(12345);

        $this->app->instance(PennylaneService::class, $mock);

        $response = $this->postJson('/api/client-id', [
            'name' => 'John Doe'
        ]);

        $response->assertStatus(200)
                ->assertJson([
                    'success' => true,
                    'photographerId' => 12345
                ]);
    }

    // Ce test vérifie le cas où le client n'est pas trouvé lors de la récupération de l'ID par nom.
    // Le service retourne null, et on s'attend à une réponse 404 avec un message d'erreur.
    public function test_get_client_id_not_found()
    {
        $mock = Mockery::mock(PennylaneService::class);
        $mock->shouldReceive('getClientIdByName')
            ->with('Unknown Client')
            ->once()
            ->andReturn(null);

        $this->app->instance(PennylaneService::class, $mock);

        $response = $this->postJson('/api/client-id', [
            'name' => 'Unknown Client'
        ]);

        $response->assertStatus(404)
                ->assertJson([
                    'success' => false,
                    'message' => 'Client non trouvé'
                ]);
    }

    // Ce test vérifie la récupération des factures d'un client spécifique via son ID.
    // Le service retourne une liste de factures pour ce client, et on vérifie la réponse JSON.
    public function test_get_invoices_by_client()
    {
        // Mock database queries for invoice credits and payments
        DB::shouldReceive('table')
            ->with('invoice_credits')
            ->once()
            ->andReturnSelf();

        DB::shouldReceive('where')
            ->with('photographer_id', 12345)
            ->once()
            ->andReturnSelf();

        DB::shouldReceive('get')
            ->once()
            ->andReturn(collect([
                ['id' => 1, 'invoice_number' => 'INV-001', 'photographer_id' => 12345],
            ]));

        DB::shouldReceive('table')
            ->with('invoice_payments')
            ->once()
            ->andReturnSelf();

        DB::shouldReceive('where')
            ->with('photographer_id', 12345)
            ->once()
            ->andReturnSelf();

        DB::shouldReceive('get')
            ->once()
            ->andReturn(collect([
                ['id' => 3, 'invoice_number' => 'INV-003', 'photographer_id' => 12345],
            ]));

        $response = $this->getJson('/api/invoices-client/12345');

        $response->assertStatus(200)
                ->assertJsonCount(2);
    }

    // Ce test vérifie la récupération réussie d'un produit d'une facture via son numéro.
    // Le service retourne les détails du produit, et on s'attend à une réponse 200 avec ces données.
    public function test_get_product_from_invoice_success()
    {
        $mock = Mockery::mock(PennylaneService::class);
        $mock->shouldReceive('getProductFromInvoice')
            ->with('INV-001')
            ->once()
            ->andReturn([
                'label' => 'Produit test',
                'quantity' => 1
            ]);

        $this->app->instance(PennylaneService::class, $mock);

        $response = $this->getJson('/api/invoice-product/INV-001');

        $response->assertStatus(200)
                ->assertJson([
                    'label' => 'Produit test',
                    'quantity' => 1
                ]);
    }

    // Ce test vérifie le cas où le produit d'une facture n'est pas trouvé.
    // Le service retourne null, et on s'attend à une réponse 404 avec un message d'erreur.
    public function test_get_product_from_invoice_not_found()
    {
        $mock = Mockery::mock(PennylaneService::class);
        $mock->shouldReceive('getProductFromInvoice')
            ->with('INV-999')
            ->once()
            ->andReturn(null);

        $this->app->instance(PennylaneService::class, $mock);

        $response = $this->getJson('/api/invoice-product/INV-999');

        $response->assertStatus(404)
                ->assertJson([
                    'success' => false,
                    'message' => 'Produit non trouvé'
                ]);
    }

    // Ce test vérifie la récupération de la liste de tous les clients.
    // Le service retourne une liste de clients, et la réponse inclut un statut de succès et la liste.
    public function test_get_list_clients()
    {
        $mock = Mockery::mock(PennylaneService::class);
        $mock->shouldReceive('getListClients')
            ->once()
            ->andReturn([
                ['id' => 1, 'name' => 'Client 1'],
                ['id' => 2, 'name' => 'Client 2']
            ]);

        $this->app->instance(PennylaneService::class, $mock);

        $response = $this->getJson('/api/list-clients');

        $response->assertStatus(200)
                ->assertJson([
                    'success' => true,
                    'clients' => [
                        ['id' => 1, 'name' => 'Client 1'],
                        ['id' => 2, 'name' => 'Client 2']
                    ]
                ]);
    }

    // Ce test vérifie le téléchargement réussi d'une facture via une URL.
    // Il simule une requête HTTP pour récupérer le PDF et vérifie les en-têtes de réponse appropriés.
    public function test_download_invoice_success()
    {
        // Mock de Http::get pour éviter les appels réels
        \Illuminate\Support\Facades\Http::shouldReceive('get')
            ->with('https://example.com/facture.pdf')
            ->once()
            ->andReturn(new class {
                public function body() {
                    return 'PDF content';
                }
            });

        $response = $this->postJson('/api/download-invoice', [
            'file_url' => 'https://example.com/facture.pdf'
        ]);

        $response->assertStatus(200)
                ->assertHeader('Content-Type', 'application/pdf')
                ->assertHeader('Content-Disposition', 'attachment; filename="facture.pdf"');
    }

    // Ce test vérifie le cas où l'URL est manquante lors du téléchargement d'une facture.
    // Sans URL, on s'attend à une réponse 400 indiquant une mauvaise requête.
    public function test_download_invoice_missing_url()
    {
        $response = $this->postJson('/api/download-invoice', []);

        $response->assertStatus(400);
    }
}

