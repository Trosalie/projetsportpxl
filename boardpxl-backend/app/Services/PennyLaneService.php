<?php

namespace App\Services;

use GuzzleHttp\Client;
use App\Models\Invoice;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class PennylaneService
{
    /**
     *
     *
     *
     * */
    protected $client;
    protected $token;

    /**
     *
     *
     *
     * */
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

    /**
     *
     *
     * @return Client
     * */
    public function getHttpClient(): Client
    {
        return $this->client;
    }

    /**
     * Get all invoices
     *
     * @return array
     * */
    public function getInvoices()
    {
        $allInvoices = [];
        $cursor = null;

        $lastSync = Invoice::max('updated_at_api');

        $updatedAfter = $lastSync ? $lastSync->toIso8601String() : null;

        do {
            $response = $this->client->get('customer_invoices', [
                'query' => array_filter([
                    'limit' => 100,
                    'cursor' => $cursor,
                    'sort' => '-id',
                    'updated_after' => $updatedAfter
                ])
            ]);

            $data = json_decode($response->getBody()->getContents(), true);

            if (!isset($data['items'])) {
                break;
            }

            $allInvoices = array_merge($allInvoices, $data['items']);

            $cursor = $data['next_cursor'] ?? null;
            $hasMore = $data['has_more'] ?? false;

            // Add delay to avoid rate limiting
            if ($hasMore) {
                usleep(500000); // 0.5 second delay between requests
            }

        } while ($hasMore);

        return $allInvoices;
    }

    /**
     * Get the invoice with a specific number
     *
     * @param string $invoiceNumber
     * @return array
     * */
    public function getInvoiceByNumber(string $invoiceNumber): ?array
    {
        $allInvoices = $this->getInvoices();

        foreach ($allInvoices as $invoice) {
            if (isset($invoice['invoice_number']) && $invoice['invoice_number'] === $invoiceNumber) {
                return $invoice;
            }
        }

        return null; // Facture non trouvée
    }

    /**
     * Get all the invoices of a specific Client
     *
     * @param int $idClient
     * @return array
     * */
    public function getInvoicesByIdClient(int $idClient): array
    {
        $allInvoices = $this->getInvoices();

        $clientInvoices = array_filter($allInvoices, function ($invoice) use ($idClient) {
            return isset($invoice['customer']['id']) && $invoice['customer']['id'] == $idClient;
        });

        return array_values($clientInvoices); // Ré-indexe le tableau
    }

    /**
     * Get the id of a specific client name
     *
     * @param string $name
     * @return int
     * */
    public function getClientIdByName(string $name): ?int
    {
        // Récupérer tous les clients
        $clients = $this->getListClients();

        // Filtrer le client par nom et prénom (insensible à la casse)
        foreach ($clients as $client) {
            $clientName = $client['name'] ?? '';

            if (strcasecmp($clientName, $name) === 0) {
                return $client['id'];
            }
        }

        return null; // Aucun client trouvé
    }

    /**
     * add a credit invoice for a client
     *
     * @param string $labelTVA
     * @param string $labelProduct
     * @param string $description
     * @param string $amountEuro
     * @param string $issueDate
     * @param string $dueDate
     * @param int $idClient
     * @param string $invoiceTitle
     * @return json
     * */
    public function createCreditsInvoiceClient(string $labelTVA, string $labelProduct, string $description, string $amountEuro, string $issueDate, string $dueDate, int $idClient, string $invoiceTitle)
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

    /**
     * add a payment invoice for a client
     *
     * @param string $labelTVA
     * @param string $amountEuro
     * @param string $issueDate
     * @param string $dueDate
     * @param int $idClient
     * @param string $invoiceTitle
     * @param string $invoiceDescription
     * @return json
     * */
    public function createTurnoverInvoiceClient(string $labelTVA, string $amountEuro, string $issueDate, string $dueDate, int $idClient, string $invoiceTitle, string $invoiceDescription)
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
                        "label" => "Commission SportPxl",
                        "description" => "Le CA & la commission sont estimés. Ils seront ajustés en fin d'exercice.",
                        "quantity" => 1,
                        "raw_currency_unit_price" => $amountEuro,
                        "unit" => "piece"
                    ]
                ],
                "date" => $issueDate,
                "deadline" => $dueDate,
                "customer_id" => $idClient,
                "customer_invoice_template_id" => 207554338,
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

    /**
     * get all photographers
     *
     * @return array
     * */
    public function getPhotographers()
    {
        $response = $this->client->get('customers?sort=-id');
        $data = json_decode($response->getBody()->getContents(), true);

        return $data['items'] ?? [];
    }

    /**
     * get ... from a specific invoice
     *
     * @param string $invoiceNumber
     * @return array
     * */
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

    /**
     * get the 100 first clients
     *
     * @return array
     * */
    public function getListClients(): array
    {
        $allClients = [];
        $cursor = null;

        do {
            $response = $this->client->get('customers', [
                'query' => array_filter([
                    'limit' => 100,           // max PennyLane
                    'cursor' => $cursor,      // null pour la 1ère page
                    'sort' => '-id',
                ])
            ]);

            $data = json_decode($response->getBody()->getContents(), true);

            if (!isset($data['items'])) {
                break; // sécurité
            }

            $allClients = array_merge($allClients, $data['items']);

            // valeurs de pagination
            $cursor = $data['next_cursor'] ?? null;
            $hasMore = $data['has_more'] ?? false;

        } while ($hasMore);

        return $allClients;
    }

    /**
     * get the invoice with a specific id
     *
     * @param int $id
     * @return array
     * */
    public function getInvoiceById(int $id): ?array
    {
        $response = $this->client->get("customer_invoices/{$id}");

        if ($response->getStatusCode() === 200) {
            return json_decode($response->getBody()->getContents(), true);
        }

        return null; // Facture non trouvée
    }

    /**
     * update the credit invoices
     * */
    public function syncInvoices(): void
    {
        try {
            $invoices = $this->getInvoices();

            foreach ($invoices as $invoice) {

                if (!isset($invoice['id']) or !str_contains(strtolower($invoice['label']), 'crédits')) {
                    continue;
                }

                Invoice::updateOrCreate(
                    [
                        'external_id' => $invoice['id'],
                    ],
                    [
                        'invoice_number' => $invoice['invoice_number'] ?? null,
                        'status'         => $invoice['status'] ?? null,
                        'total_amount'   => $invoice['total_amount'] ?? 0,
                        'currency'       => $invoice['currency'] ?? 'EUR',

                        'customer_id'    => $invoice['customer']['id'] ?? null,
                        'customer_name'  => $invoice['customer']['name'] ?? null,

                        'issued_at'      => isset($invoice['date'])
                            ? Carbon::parse($invoice['date'])
                            : null,

                        'due_at'         => isset($invoice['deadline'])
                            ? Carbon::parse($invoice['deadline'])
                            : null,

                        // trace de synchro API
                        'updated_at_api' => isset($invoice['updated_at'])
                            ? Carbon::parse($invoice['updated_at'])
                            : now(),
                    ]
                );
            }
        } catch (\Throwable $e) {
            Log::error('PennyLane sync failed', [
                'message' => $e->getMessage(),
            ]);
        }
    }
}

