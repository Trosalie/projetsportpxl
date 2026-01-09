<?php

namespace App\Services;

use GuzzleHttp\Client;

class PennylaneService
{
    protected $photographer;
    protected $token;

    public function __construct()
    {
        $this->token = config('services.pennylane.token');

        $this->photographer = new Client([
            'base_uri' => 'https://app.pennylane.com/api/external/v2/',
            'headers' => [
                'Accept' => 'application/json',
                'Authorization' => 'Bearer ' . $this->token,
            ],
            'verify' => false,
        ]);
    }

    public function getHttpPhotographer(): Client
    {
        return $this->photographer;
    }

    // Récupérer toutes les factures
    public function getInvoices()
    {
        $allInvoices = [];
        $cursor = null;

        do {
            $response = $this->photographer->get('customer_invoices', [
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

            // Add delay to avoid rate limiting
            if ($hasMore) {
                usleep(500000); // 0.5 second delay between requests
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

        return null; // Facture non trouvée
    }


    // Récupérer les factures d'un photographe par son ID
    public function getInvoicesByIdPhotographer(int $idPhotographer): array
    {
        $allInvoices = $this->getInvoices();

        $photographerInvoices = array_filter($allInvoices, function ($invoice) use ($idPhotographer) {
            return isset($invoice['customer']['id']) && $invoice['customer']['id'] == $idPhotographer;
        });

        return array_values($photographerInvoices); // Ré-indexe le tableau
    }

    // Récupérer l'ID photographe par nom et prénom
    public function getPhotographerIdByName(string $name): ?int
    {
        // Récupérer tous les photographes
        $photographers = $this->getListPhotographers();

        // Filtrer le photographe par nom et prénom (insensible à la casse)
        foreach ($photographers as $photographer) {
            $photographerName = $photographer['name'] ?? '';

            if (strcasecmp($photographerName, $name) === 0) {
                return $photographer['id'];
            }
        }

        return null; // Aucun photographe trouvé
    }


    // Création d'une facture d'achat de crédit pour un photographe
    public function createCreditsInvoicePhotographer(string $labelTVA, string $labelProduct, string $description, string $amountEuro, string $issueDate, string $dueDate, int $idPhotographer, string $invoiceTitle)
    {
        $photographer = new \GuzzleHttp\Client();

        $response = $photographer->request('POST', 'https://app.pennylane.com/api/external/v2/customer_invoices', [
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
                "customer_id" => $idPhotographer,
                "pdf_invoice_subject" => $invoiceTitle
            ],
            'headers' => [
                'Accept' => 'application/json',
                'Authorization' => 'Bearer ' . config('services.pennylane.token'),
            ],
        ]);

        return json_decode($response->getBody()->getContents(), true);
    }

    // Création d'une facture d'achat de crédit pour un photographe
    public function createTurnoverInvoicePhotographer(string $labelTVA, string $amountEuro, string $issueDate, string $dueDate, int $idPhotographer, string $invoiceTitle, string $invoiceDescription)
    {
        $photographer = new \GuzzleHttp\Client();

        $response = $photographer->request('POST', 'https://app.pennylane.com/api/external/v2/customer_invoices', [
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
                "customer_id" => $idPhotographer,
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
        $response = $this->photographer->get('customers?sort=-id');
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

    public function getListPhotographers(): array
    {
        $allPhotographers = [];
        $cursor = null;

        do {
            $response = $this->photographer->get('customers', [
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

            $allPhotographers = array_merge($allPhotographers, $data['items']);

            // valeurs de pagination
            $cursor = $data['next_cursor'] ?? null;
            $hasMore = $data['has_more'] ?? false;

        } while ($hasMore);

        return $allPhotographers;
    }

    public function getInvoiceById(int $id): ?array
    {
        $response = $this->photographer->get("customer_invoices/{$id}");

        if ($response->getStatusCode() === 200) {
            return json_decode($response->getBody()->getContents(), true);
        }

        return null; // Facture non trouvée
    }

}

