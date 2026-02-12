<?php

namespace Tests\Feature\Api;

use App\Http\Controllers\InvoiceController;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Tests\TestCase;
use Illuminate\Support\Facades\DB;
use Mockery;

class InvoiceTest extends TestCase
{
    use WithoutMiddleware;

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_insert_turnover_invoice_success()
    {
        // Mock DB insert
        DB::shouldReceive('table')
            ->once()
            ->with('invoice_payments')
            ->andReturnSelf();

        DB::shouldReceive('insert')
            ->once()
            ->andReturn(true);

        $response = $this->postJson('/api/insert-turnover-invoice', [
            'id' => 1,
            'number' => 'INV-001',
            'issue_date' => now()->toDateString(),
            'due_date' => now()->addDays(30)->toDateString(),
            'description' => 'Test facture',
            'turnover' => 1000,
            'raw_value' => 800,
            'commission' => 200,
            'tax' => 40,
            'vat' => 20,
            'start_period' => now()->subMonth()->toDateString(),
            'end_period' => now()->toDateString(),
            'link_pdf' => 'https://example.com/invoice.pdf',
            'photographer_id' => 5,
            'pdf_invoice_subject' => 'Facture CA'
        ]);

        $response
            ->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Invoice stored successfully.',
            ]);
    }

    public function test_insert_turnover_invoice_validation_error()
    {
        $response = $this->postJson('/api/insert-turnover-invoice', []);

        $response
            ->assertStatus(422)
            ->assertJsonValidationErrors([
                'id',
                'number',
                'issue_date',
                'due_date',
                'raw_value',
                'tax',
                'vat',
                'start_period',
                'end_period',
                'link_pdf',
                'photographer_id',
                'pdf_invoice_subject',
            ]);
    }


    public function test_insert_credits_invoice_success()
    {
        DB::shouldReceive('table')
            ->once()
            ->with('invoice_credits')
            ->andReturnSelf();

        DB::shouldReceive('insert')
            ->once()
            ->andReturn(true);

        $response = $this->postJson('/api/insert-credits-invoice', [
            'id' => 2,
            'number' => 'INV-CR-001',
            'issue_date' => now()->toDateString(),
            'due_date' => now()->addDays(30)->toDateString(),
            'description' => 'Facture crédits',
            'amount' => 100,
            'tax' => 20,
            'vat' => 10,
            'total_due' => 130,
            'credits' => 40000,
            'status' => 'paid',
            'link_pdf' => 'https://example.com/credits.pdf',
            'photographer_id' => 10,
            'pdf_invoice_subject' => 'Facture crédits'
        ]);

        $response
            ->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Credit invoice stored successfully.',
            ]);
    }

    public function test_insert_credits_invoice_validation_error()
    {
        $response = $this->postJson('/api/insert-credits-invoice', []);

        $response
            ->assertStatus(422)
            ->assertJsonValidationErrors([
                'id',
                'number',
                'issue_date',
                'due_date',
                'amount',
                'tax',
                'vat',
                'total_due',
                'credits',
                'status',
                'link_pdf',
                'photographer_id',
                'pdf_invoice_subject',
            ]);
    }


    public function test_get_invoices_payment_by_photographer_success()
    {
        DB::shouldReceive('table')
            ->once()
            ->with('invoice_payments')
            ->andReturnSelf();

        DB::shouldReceive('where')
            ->once()
            ->with('photographer_id', 10)
            ->andReturnSelf();

        DB::shouldReceive('get')
            ->once()
            ->andReturn(collect([
                ['id' => 1, 'number' => 'INV-001'],
                ['id' => 2, 'number' => 'INV-002'],
            ]));

        $response = $this->getJson('/api/invoices-payment/10');

        $response
            ->assertStatus(200)
            ->assertJson([
                ['id' => 1, 'number' => 'INV-001'],
                ['id' => 2, 'number' => 'INV-002'],
            ]);
    }

    // Ce test vérifie le cas où une facture n'est pas trouvée par son ID.
    // Le contrôleur interroge d'abord invoice_credits puis invoice_payments, et les deux retournent null.
    // On s'attend à une réponse 404 avec un message d'erreur.
    public function test_get_invoice_by_id_not_found()
    {
        // Mock pour invoice_credits - pas trouvé
        DB::shouldReceive('table')
            ->once()
            ->with('invoice_credits')
            ->andReturnSelf();

        DB::shouldReceive('where')
            ->once()
            ->with('id', 999)
            ->andReturnSelf();

        DB::shouldReceive('first')
            ->once()
            ->andReturn(null);

        // Mock pour invoice_payments - pas trouvé non plus
        DB::shouldReceive('table')
            ->once()
            ->with('invoice_payments')
            ->andReturnSelf();

        DB::shouldReceive('where')
            ->once()
            ->with('id', 999)
            ->andReturnSelf();

        DB::shouldReceive('first')
            ->once()
            ->andReturn(null);

        $response = $this->getJson('/api/invoices/999');

        $response->assertStatus(404)
                ->assertJson([
                    'message' => 'Facture non trouvée'
                ]);
    }

    // Ce test vérifie la récupération réussie d'une facture spécifique par son ID.
    // Le contrôleur interroge d'abord invoice_credits et trouve la facture.
    // On s'attend à une réponse 200 avec les détails de la facture.
    public function test_get_invoice_by_id_success()
    {
        // Mock pour invoice_credits - facture trouvée
        DB::shouldReceive('table')
            ->once()
            ->with('invoice_credits')
            ->andReturnSelf();

        DB::shouldReceive('where')
            ->once()
            ->with('id', 123)
            ->andReturnSelf();

        DB::shouldReceive('first')
            ->once()
            ->andReturn((object)[
                'id' => 123,
                'number' => 'INV-123',
                'amount' => 100.00
            ]);

        $response = $this->getJson('/api/invoices/123');

        $response->assertStatus(200)
                ->assertJson([
                    'id' => 123,
                    'number' => 'INV-123',
                    'amount' => 100.00
                ]);
    }

    public function test_get_invoices_credit_by_photographer_success()
    {
        DB::shouldReceive('table')
            ->once()
            ->with('invoice_credits')
            ->andReturnSelf();

        DB::shouldReceive('where')
            ->once()
            ->with('photographer_id', 20)
            ->andReturnSelf();

        DB::shouldReceive('get')
            ->once()
            ->andReturn(collect([
                ['id' => 7, 'number' => 'CR-1'],
                ['id' => 8, 'number' => 'CR-2'],
            ]));

        $response = $this->getJson('/api/invoices-credit/20');

        $response->assertStatus(200)
            ->assertJson([
                ['id' => 7, 'number' => 'CR-1'],
                ['id' => 8, 'number' => 'CR-2'],
            ]);
    }

    public function test_get_invoices_credit_by_photographer_invalid()
    {
        $response = $this->getJson('/api/invoices-credit/abc');

        $response->assertStatus(422)->assertJson(['success' => false, 'message' => 'Invalid photographer id']);
    }

    public function test_get_invoices_by_photographer_success()
    {
        // credits
        DB::shouldReceive('table')
            ->once()
            ->with('invoice_credits')
            ->andReturnSelf();

        DB::shouldReceive('where')
            ->once()
            ->with('photographer_id', 30)
            ->andReturnSelf();

        DB::shouldReceive('get')
            ->once()
            ->andReturn(collect([
                (object)['id' => 11, 'number' => 'C-11']
            ]));

        // payments
        DB::shouldReceive('table')
            ->once()
            ->with('invoice_payments')
            ->andReturnSelf();

        DB::shouldReceive('where')
            ->once()
            ->with('photographer_id', 30)
            ->andReturnSelf();

        DB::shouldReceive('get')
            ->once()
            ->andReturn(collect([
                (object)['id' => 21, 'number' => 'P-21']
            ]));

        $response = $this->getJson('/api/invoices-photographer/30');

        $response->assertStatus(200)->assertJson([
            ['id' => 11, 'number' => 'C-11'],
            ['id' => 21, 'number' => 'P-21'],
        ]);
    }

    public function test_get_invoices_by_photographer_invalid()
    {
        $response = $this->getJson('/api/invoices-photographer/xyz');

        $response->assertStatus(422)->assertJson(['success' => false, 'message' => 'Invalid photographer id']);
    }

    public function test_get_bulk_invoices_by_photographers_success()
    {
        $payload = ['photographer_ids' => [1,2]];

        DB::shouldReceive('table')
            ->once()
            ->with('invoice_credits')
            ->andReturnSelf();

        DB::shouldReceive('whereIn')
            ->once()
            ->with('photographer_id', $payload['photographer_ids'])
            ->andReturnSelf();

        DB::shouldReceive('get')
            ->once()
            ->andReturn(collect([
                (object)['photographer_id' => 1, 'id' => 101],
                (object)['photographer_id' => 2, 'id' => 102],
            ]));

        DB::shouldReceive('table')
            ->once()
            ->with('invoice_payments')
            ->andReturnSelf();

        DB::shouldReceive('whereIn')
            ->once()
            ->with('photographer_id', $payload['photographer_ids'])
            ->andReturnSelf();

        DB::shouldReceive('get')
            ->once()
            ->andReturn(collect([
                (object)['photographer_id' => 1, 'id' => 201],
                (object)['photographer_id' => 2, 'id' => 202],
            ]));

        $response = $this->postJson('/api/invoices-bulk', $payload);

        $response->assertStatus(200)->assertJsonStructure([
            '1' => ['credits','payments'],
            '2' => ['credits','payments']
        ]);
    }

    public function test_get_financial_info_credits_invoice()
    {
        DB::shouldReceive('table')
            ->once()
            ->with('invoice_credits')
            ->andReturnSelf();

        DB::shouldReceive('select')
            ->once()
            ->with('id','issue_date', 'amount', 'credits')
            ->andReturnSelf();

        DB::shouldReceive('get')
            ->once()
            ->andReturn(collect([
                ['id'=>1,'issue_date'=>now()->toDateString(),'amount'=>10,'credits'=>100]
            ]));

        $response = $this->getJson('/api/invoice-credits-financial-info');

        $response->assertStatus(200)->assertJson([
            ['id'=>1,'issue_date'=>now()->toDateString(),'amount'=>10,'credits'=>100]
        ]);
    }

    public function test_get_financial_info_turnover_invoice()
    {
        DB::shouldReceive('table')
            ->once()
            ->with('invoice_payments')
            ->andReturnSelf();

        DB::shouldReceive('select')
            ->once()
            ->with('id','issue_date', 'raw_value', 'commission')
            ->andReturnSelf();

        DB::shouldReceive('get')
            ->once()
            ->andReturn(collect([
                ['id'=>2,'issue_date'=>now()->toDateString(),'raw_value'=>50,'commission'=>5]
            ]));

        $response = $this->getJson('/api/invoice-turnover-financial-info');

        $response->assertStatus(200)->assertJson([
            ['id'=>2,'issue_date'=>now()->toDateString(),'raw_value'=>50,'commission'=>5]
        ]);
    }
}

