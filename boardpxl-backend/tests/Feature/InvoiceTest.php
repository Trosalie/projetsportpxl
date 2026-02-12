<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\Invoice;
use App\Models\Photographer;

class InvoiceTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    /**
     * Test les attributs fillable de la facture
     */
    public function test_invoice_fillable_attributes(): void
    {
        $invoice = new Invoice();
        $fillable = ['number', 'issue_date', 'due_date', 'description', 'tax', 'vat', 'link_pdf'];
        
        $this->assertEquals($fillable, $invoice->getFillable());
    }

    /**
     * Test que l'on peut accéder aux attributs de la facture
     */
    public function test_invoice_attributes_exist(): void
    {
        $invoice = new Invoice();
        $invoice->number = 'INV-001';
        $invoice->description = 'Test';
        
        $this->assertEquals('INV-001', $invoice->number);
        $this->assertEquals('Test', $invoice->description);
    }

    /**
     * Test que le modèle a le bon nom de table
     */
    public function test_invoice_table_name(): void
    {
        $invoice = new Invoice();
        $this->assertEquals('invoices', $invoice->getTable());
    }
}
