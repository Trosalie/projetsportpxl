<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\InvoicePayment;
use App\Models\Photographer;

class InvoicePaymentTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    /**
     * Test que le modèle InvoicePayment existe
     */
    public function test_invoice_payment_model_exists(): void
    {
        $this->assertInstanceOf(InvoicePayment::class, new InvoicePayment());
    }

    /**
     * Test le nom de la table
     */
    public function test_invoice_payment_table_name(): void
    {
        $invoicePayment = new InvoicePayment();
        $this->assertEquals('invoice_payments', $invoicePayment->getTable());
    }

    /**
     * Test les attributs du modèle
     */
    public function test_invoice_payment_has_attributes(): void
    {
        $invoicePayment = new InvoicePayment();
        $invoicePayment->number = 'PAY-001';
        $invoicePayment->amount = 500.00;
        
        $this->assertEquals('PAY-001', $invoicePayment->number);
        $this->assertEquals(500.00, $invoicePayment->amount);
    }
}
