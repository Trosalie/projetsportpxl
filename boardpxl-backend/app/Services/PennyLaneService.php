<?php

namespace App\Services;

use GuzzleHttp\Client;

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

    // Récupérer toutes les factures
    public function getInvoices()
    {
        $response = $this->client->get('customer_invoices?sort=-id');
        $data = json_decode($response->getBody()->getContents(), true);

        return $data['items'] ?? [];
    }

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


    // Récupérer les factures d'un client par son ID
    public function getInvoicesByIdClient(int $idClient): array
    {
        $allInvoices = $this->getInvoices();

        $clientInvoices = array_filter($allInvoices, function ($invoice) use ($idClient) {
            return isset($invoice['customer']['id']) && $invoice['customer']['id'] == $idClient;
        });

        return array_values($clientInvoices); // Ré-indexe le tableau
    }

    // Récupérer l'ID client par nom et prénom
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

    
    // Création d'une facture d'achat de crédit pour un client
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

    // Création d'une facture d'achat de crédit pour un client
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

    public function getPhotographers()
    {
        $response = $this->client->get('customers?sort=-id');
        $data = json_decode($response->getBody()->getContents(), true);

        return $data['items'] ?? [];
    }

    public function getProductFromInvoice(string $invoiceNumber): ?string
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
                $http = new \GuzzleHttp\Client();
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

    public function getInvoiceById(int $id): ?array
    {
        $response = $this->client->get("customer_invoices/{$id}");

        if ($response->getStatusCode() === 200) {
            return json_decode($response->getBody()->getContents(), true);
        }

        return null; // Facture non trouvée
    }

}

