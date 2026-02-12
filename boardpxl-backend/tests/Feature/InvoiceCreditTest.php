<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\InvoiceCredit;
use App\Models\Photographer;

class InvoiceCreditTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    /**
     * Test que le modèle InvoiceCredit existe
     */
    public function test_invoice_credit_model_exists(): void
    {
        $this->assertInstanceOf(InvoiceCredit::class, new InvoiceCredit());
    }

    /**
     * Test le nom de la table
     */
    public function test_invoice_credit_table_name(): void
    {
        $invoiceCredit = new InvoiceCredit();
        $this->assertEquals('invoice_credits', $invoiceCredit->getTable());
    }

    /**
     * Test les attributs du modèle
     */
    public function test_invoice_credit_has_attributes(): void
    {
        $invoiceCredit = new InvoiceCredit();
        $invoiceCredit->number = 'CREDIT-001';
        $invoiceCredit->amount = 100.00;
        
        $this->assertEquals('CREDIT-001', $invoiceCredit->number);
        $this->assertEquals(100.00, $invoiceCredit->amount);
    }
}
