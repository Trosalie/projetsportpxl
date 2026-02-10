<?php

namespace App\Services;

use App\Http\Controllers\InvoiceController;
use GuzzleHttp\Client;
use App\Models\InvoiceCredit;
use App\Models\InvoicePayment;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use App\Models\Photographer;

class PennylaneService
{
    protected $client;
    protected $token;

    public function __construct()
    {
        $this->token = config('services.pennylane.token');

        $this->client = new Client([
            'base_uri' => 'https://app.pennylane.com/api/external/v2/',
            'headers' => [
                'Accept' => 'application/json',
                'Authorization' => 'Bearer ' . $this->token,
            ],
            'verify' => false,
        ]);
    }

    public function getHttpClient(): Client
    {
        return $this->client;
    }

    public function getInvoices()
    {
        $allInvoices = [];
        $cursor = null;

        do {
            $response = $this->client->get('customer_invoices', [
                'query' => array_filter([
                    'limit' => 100,
                    'cursor' => $cursor,
                    'sort' => '-id',
                ])
            ]);

            $data = json_decode($response->getBody()->getContents(), true);

            if (!isset($data['items'])) {
                break;
            }

            $allInvoices = array_merge($allInvoices, $data['items']);

            $cursor = $data['next_cursor'] ?? null;
            $hasMore = $data['has_more'] ?? false;

            if ($hasMore) {
                usleep(500000);
            }

        } while ($hasMore);

        return $allInvoices;
    }

    public function getInvoiceByNumber(string $invoiceNumber): ?array
    {
        $allInvoices = $this->getInvoices();

        foreach ($allInvoices as $invoice) {
            if (isset($invoice['invoice_number']) && $invoice['invoice_number'] === $invoiceNumber) {
                return $invoice;
            }
        }

        return null;
    }

    public function getInvoicesByIdClient(int $idClient): array
    {
        $allInvoices = $this->getInvoices();

        $clientInvoices = array_filter($allInvoices, function ($invoice) use ($idClient) {
            return isset($invoice['customer']['id']) && $invoice['customer']['id'] == $idClient;
        });

        return array_values($clientInvoices);
    }

    public function getClientIdByName(string $name): ?int
    {
        $clients = $this->getListClients();

        foreach ($clients as $client) {
            $clientName = $client['name'] ?? '';

            if (strcasecmp($clientName, $name) === 0) {
                return $client['id'];
            }
        }

        return null;
    }

    public function createCreditsInvoiceClient(string $labelTVA, string $labelProduct, string $description, string $amountEuro, string $discount, string $issueDate, string $dueDate, int $idClient, string $invoiceTitle)
    {
        $client = new \GuzzleHttp\Client();

        $response = $client->request('POST', 'https://app.pennylane.com/api/external/v2/customer_invoices', [
            'json' => [
                "currency" => "EUR",
                "language" => "fr_FR",
                "discount" => [
                    "type" => "relative",
                    "value" => "0"
                ],
                "draft" => false,
                "invoice_lines" => [
                    [
                        "discount" => [
                            "type" => "relative",
                            "value" => $discount
                        ],
                        "vat_rate" => $labelTVA,
                        "label" => $labelProduct,
                        "description" => $description,
                        "quantity" => 1,
                        "raw_currency_unit_price" => $amountEuro,
                        "unit" => "piece"
                    ]
                ],
                "date" => $issueDate,
                "deadline" => $dueDate,
                "customer_id" => $idClient,
                "pdf_invoice_subject" => $invoiceTitle
            ],
            'headers' => [
                'Accept' => 'application/json',
                'Authorization' => 'Bearer ' . config('services.pennylane.token'),
            ],
        ]);

        return json_decode($response->getBody()->getContents(), true);
    }

    public function createTurnoverInvoiceClient(string $labelTVA, string $issueDate, string $dueDate, int $idClient, string $invoiceTitle, string $invoiceDescription)
    {
        $client = new \GuzzleHttp\Client();

        $response = $client->request('POST', 'https://app.pennylane.com/api/external/v2/customer_invoices', [
            'json' => [
                "currency" => "EUR",
                "language" => "fr_FR",
                "discount" => [
                    "type" => "absolute",
                    "value" => "0"
                ],
                "draft" => false,
                "invoice_lines" => [
                    [
                        "discount" => [
                            "type" => "absolute",
                            "value" => "0"
                        ],
                        "vat_rate" => $labelTVA,
                        "label" => "Versement",
                        "quantity" => 1,
                        "raw_currency_unit_price" => "0",
                        "unit" => "piece"
                    ]
                ],
                "date" => $issueDate,
                "deadline" => $dueDate,
                "customer_id" => $idClient,
                "pdf_invoice_subject" => $invoiceTitle,
                "pdf_description" => $invoiceDescription,
            ],
            'headers' => [
                'Accept' => 'application/json',
                'Authorization' => 'Bearer ' . config('services.pennylane.token'),
            ],
        ]);

        return json_decode($response->getBody()->getContents(), true);
    }

    public function getPhotographers()
    {
        $response = $this->client->get('customers?sort=-id');
        $data = json_decode($response->getBody()->getContents(), true);

        return $data['items'] ?? [];
    }

    public function getProductFromInvoice(string $invoiceNumber): ?array
    {
        $invoice = $this->getInvoiceByNumber($invoiceNumber);

        try {
            $url = null;

            if (isset($invoice['invoice_lines']['url'])) {
                $url = $invoice['invoice_lines']['url'];
            } elseif (is_array($invoice['invoice_lines']) && isset($invoice['invoice_lines'][0]['url'])) {
                $url = $invoice['invoice_lines'][0]['url'];
            }

            if ($url) {
                $http = new Client();
                $response = $http->get($url, [
                    'headers' => [
                        'Accept' => 'application/json',
                        'Authorization' => 'Bearer ' . $this->token,
                    ],
                ]);

                $responseBody = $response->getBody()->getContents();
                $data = json_decode($responseBody, true);

                if (!empty($data['items']) && isset($data['items'][0]['label'])) {
                    return [
                        'label' => $data['items'][0]['label'],
                        'quantity' => $data['items'][0]['quantity'] ?? null,
                    ];
                }
            }
        } catch (\Throwable $e) {
            // ignore or log the error as needed
        }

        return null; // Produit non trouvé
    }

    public function getListClients(): array
    {
        $allClients = [];
        $cursor = null;

        do {
            $response = $this->client->get('customers', [
                'query' => array_filter([
                    'limit' => 100,
                    'cursor' => $cursor,
                    'sort' => '-id',
                ])
            ]);

            $data = json_decode($response->getBody()->getContents(), true);

            if (!isset($data['items'])) {
                break;
            }

            $allClients = array_merge($allClients, $data['items']);

            $cursor = $data['next_cursor'] ?? null;
            $hasMore = $data['has_more'] ?? false;

        } while ($hasMore);

        return $allClients;
    }

    public function getInvoiceById(int $id): ?array
    {
        $response = $this->client->get("customer_invoices/{$id}");

        if ($response->getStatusCode() === 200) {
            return json_decode($response->getBody()->getContents(), true);
        }

        return null; // Facture non trouvée
    }

    public function syncInvoices(): void
    {
        try {
            $invoices = $this->getInvoices();

            foreach ($invoices as $invoice) {
                try {
                    if (!isset($invoice['id'])) {
                        continue;
                    }

                    $product = $this->getProductFromInvoice($invoice['invoice_number']);
                    if (!$product) {
                        Log::warning('Could not get product for invoice: ' . $invoice['invoice_number']);
                        continue;
                    }

                    $isCredit = str_contains(strtolower($product['label'] ?? ''), 'crédits');
                    $vat = isset($invoice['tax'], $invoice['currency_amount_before_tax']) && $invoice['currency_amount_before_tax'] != 0
                        ? $invoice['tax'] / $invoice['currency_amount_before_tax'] * 100
                        : 0;

                    if($isCredit){
                        $raw = $product['label'] ?? '';
                        $clean = preg_replace('/crédits/i', '', $raw);
                        $clean = preg_replace('/\\s+/', '', $clean);
                        $clean = str_replace(',', '.', $clean);
                        $clean = preg_replace('/[^\\d\\.-]/', '', $clean);
                        $creditAmount = empty($clean) ? $product['quantity'] ?? 0 : (float) $clean;

                        $invoicePrev = InvoiceCredit::find($invoice['id']);

                        $photographerId = null;
                        if ($invoicePrev) {
                            $photographerId = $invoicePrev->photographer_id;
                        } elseif (isset($invoice['customer']['id'])) {
                            $photographer = Photographer::where('pennylane_id', $invoice['customer']['id'])->first();
                            if ($photographer) {
                                $photographerId = $photographer->id;
                            }
                        }

                        if (!$photographerId) {
                            Log::warning('Photographer not found for invoice: ' . $invoice['invoice_number']);
                            continue;
                        }

                        InvoiceCredit::updateOrCreate(
                            [
                                'id' => $invoice['id'],
                            ],
                            [
                                'number' => $invoice['invoice_number'] ?? null,
                                'issue_date' => $invoice['date'] ?? null,
                                'due_date' => $invoice['deadline'] ?? null,
                                'description' => $invoice['pdf_description'] ?? "N/A",
                                'amount' => $invoice['amount'] ?? null,
                                'tax' => $invoice['tax'] ?? null,
                                'vat' => $vat ?? null,
                                'total_due' => $invoice['remaining_amount_with_tax'] ?? null,
                                'discount' => $invoice['discount']['value'] ?? 0,
                                'credits' => $creditAmount ?? null,
                                'status' => $invoice['status'] ?? null,
                                'link_pdf' => $invoice['public_file_url'] ?? null,
                                'pdf_invoice_subject' => $invoice['pdf_invoice_subject'] ?? null,
                                'photographer_id' => $photographerId,
                            ]
                        );
                    }
                    else {
                        $match = [];
                        preg_match('/(\\d+(?:[.,]\\d{2})?)\\s*€/', $invoice['pdf_description'] ?? '', $match);
                        $rawValue = $match ? (float) str_replace(',', '.', $match[1]) : 0;

                        $invoicePrev = InvoicePayment::find($invoice['id']);

                        $photographerId = null;
                        if ($invoicePrev) {
                            $photographerId = $invoicePrev->photographer_id;
                        } elseif (isset($invoice['customer']['id'])) {
                            $photographer = Photographer::where('pennylane_id', $invoice['customer']['id'])->first();
                            if ($photographer) {
                                $photographerId = $photographer->id;
                            }
                        }

                        if (!$photographerId) {
                            Log::warning('Photographer not found for invoice: ' . $invoice['invoice_number']);
                            continue;
                        }

                        $startPeriod = $invoicePrev ? $invoicePrev->start_period : now()->startOfMonth();
                        $endPeriod = $invoicePrev ? $invoicePrev->end_period : now()->endOfMonth();

                        InvoicePayment::updateOrCreate(
                            [
                                'id' => $invoice['id'],
                            ],
                            [
                                'number' => $invoice['invoice_number'] ?? null,
                                'issue_date' => $invoice['date'] ?? null,
                                'due_date' => $invoice['deadline'] ?? null,
                                'description' => $invoice['pdf_description'] ?? "N/A",
                                'raw_value' => $rawValue ?? null,
                                'tax' => $invoice['tax'] ?? null,
                                'vat' => $vat ?? null,
                                'start_period' => $startPeriod,
                                'end_period' => $endPeriod,
                                'link_pdf' => $invoice['public_file_url'] ?? null,
                                'pdf_invoice_subject' => $invoice['pdf_invoice_subject'] ?? null,
                                'photographer_id' => $photographerId,
                            ]
                        );
                    }
                } catch (\Throwable $e) {
                    Log::error('Failed to sync invoice: ' . ($invoice['id'] ?? 'unknown'), [
                        'error' => $e->getMessage(),
                        'invoice' => $invoice
                    ]);
                }
            }
        } catch (\Throwable $e) {
            Log::error('PennyLane sync failed', [
                'message' => $e->getMessage(),
            ]);
        }
    }
}
