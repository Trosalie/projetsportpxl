<?php

namespace Tests\Feature\Api;

use Illuminate\Foundation\Testing\WithoutMiddleware;
use Tests\TestCase;
use Illuminate\Support\Facades\DB;
use Mockery;

class InvoiceControllerTest extends TestCase
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
        // On envoie un payload vide pour déclencher toutes les règles de validation
        $response = $this->postJson('/api/insert-credits-invoice', []);

        // On vérifie qu'on reçoit bien le code 422 (Unprocessable Entity)
        $response->assertStatus(422);

        // On vérifie que les erreurs contiennent bien tous les champs requis
        $response->assertJsonValidationErrors([
            'id', 'number', 'issue_date', 'due_date', 'amount',
            'tax', 'vat', 'total_due', 'credits', 'status',
            'link_pdf', 'photographer_id', 'pdf_invoice_subject'
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

}
