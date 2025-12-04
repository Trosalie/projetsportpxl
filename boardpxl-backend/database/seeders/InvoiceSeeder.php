<?php

namespace Database\Seeders;

use GuzzleHttp\Client;
use App\Services\PennylaneService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

// commande pour lancer le seeder : php artisan db:seed --class=InvoiceSeeder

class InvoiceSeeder extends Seeder
{
    /**
     * Exécuter le seeder
     *
     * @return void
     */
    public function run(): void
    {
        $invoices = $this->getInvoices();

        foreach ($invoices as $invoice) {
            $this->insererInvoice($invoice);
            usleep(500000); // Faire 2 appels par seconde pour éviter de saturer l'API Pennylane
        }
    }

    /**
     * Créer une liste de photographes à partir d'un fichier CSV
     * 
     * @param string $cheminCSV
     * @return array
     * @throws \RuntimeException
     */
    private function getInvoices(): array
    {
        $service = new PennylaneService();
        $client = $service->getHttpClient();
        $response = $client->get('customer_invoices?sort=-id');
        $data = json_decode($response->getBody()->getContents(), true);
        $returned = $data["items"];

        while($data["has_more"]) {
            $response = $client->get('customer_invoices?sort=-id&cursor=' . $data["next_cursor"]);
            $data = json_decode($response->getBody()->getContents(), true);
            $returned = array_merge($returned, $data["items"]);
        }

        $invoices = $returned ?? [];
        
        return $invoices;
    }


    /**
     * Insérer une facture dans la base de données
     * 
     * @param array $invoice
     * @return void
     */
    private function insererInvoice($invoice): void
    {
        $service = new PennylaneService();
        $product = $service->getProductFromInvoice($invoice['invoice_number']);
        $photographerId = DB::table('photographers')->where('pennylane_id', $invoice['customer']['id'])->value('id');
        
        $vat = $invoice['tax'] / $invoice['currency_amount_before_tax'] * 100;

        echo json_encode($invoice) . PHP_EOL;

        if(str_contains(strtolower($product), 'crédits')) {
            $raw = $product['product'] ?? '';
            $clean = preg_replace('/crédits/i', '', $raw);
            $clean = preg_replace('/\s+/', '', $clean);
            $clean = str_replace(',', '.', $clean);
            $clean = preg_replace('/[^\d\.-]/', '', $clean);
            $creditAmount = (float) $clean;


            DB::table('invoice_credits')->insert([
            'id' => $invoice['id'],
            'number' => $invoice['invoice_number'],
            'issue_date' => $invoice['date'],
            'due_date' => $invoice['deadline'],
            'description' => $invoice['pdf_description'] ?? 'N/A',
            'amount' => $invoice['amount'],
            'tax' => $invoice['tax'],
            'vat' => $vat,
            'total_due' => $invoice['remaining_amount_with_tax'],
            'credits' => $creditAmount,
            'status' => $invoice['status'],
            'link_pdf' => $invoice['public_file_url'],
            'photographer_id' => $photographerId,
            'pdf_invoice_subject' => $invoice['pdf_invoice_subject'],
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        }
        else {
            DB::table('invoice_payments')->insert([
                'id' => $invoice['id'],
                'number' => $invoice['invoice_number'],
                'issue_date' => $invoice['date'],
                'due_date' => $invoice['deadline'],
                'description' => $invoice['pdf_description'] ?? 'N/A',
                'raw_value' => $invoice['currency_amount_before_tax'],
                'commission' => $invoice['amount'],
                'tax' => $invoice['tax'],
                'vat' => $vat,
                'start_period' => now(),
                'end_period' => now(),
                'link_pdf' => $invoice['public_file_url'],
                'photographer_id' => $photographerId,
                'pdf_invoice_subject' => $invoice['pdf_invoice_subject'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }    
    }
}
