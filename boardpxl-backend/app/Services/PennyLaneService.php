<?php

namespace App\Services;

use GuzzleHttp\Client;

class PennylaneService
{
    protected $client;
    protected $token;

    public function __construct()
    {
        $this->token = 'eed8y6tW50z94_tiKQp7yFK-mIfnNXTNJkp1y_gRmjw';
        $this->client = new Client([
            'base_uri' => 'https://app.pennylane.com/api/external/v2/',
            'headers' => [
                'Accept' => 'application/json',
                'Authorization' => 'Bearer ' . $this->token,
            ],
        ]);
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
    public function getClientIdByName(string $prenom, string $nom): ?int
    {
        // Récupérer tous les clients
        $response = $this->client->get('customers');
        $data = json_decode($response->getBody()->getContents(), true);

        $clients = $data['items'] ?? [];

        // Filtrer le client par nom et prénom (insensible à la casse)
        foreach ($clients as $client) {
            $clientPrenom = $client['first_name'] ?? '';
            $clientNom    = $client['last_name'] ?? '';

            if (strcasecmp($clientPrenom, $prenom) === 0 && strcasecmp($clientNom, $nom) === 0) {
                return $client['id'];
            }
        }

        return null; // Aucun client trouvé
    }

    
    // Création d'une facture pour un client
    public function createInvoiceClient(string $labelTVA, string $labelProduct, string $description, string $amountEuro, string $issueDate, string $dueDate, int $idClient, string $invoiceTitle)
    {
        $client = new \GuzzleHttp\Client();
        $this->token = 'eed8y6tW50z94_tiKQp7yFK-mIfnNXTNJkp1y_gRmjw';

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
                "customer_invoice_template_id" => 207554338,
                "pdf_invoice_subject" => $invoiceTitle
            ],
            'headers' => [
                'Accept' => 'application/json',
                'Authorization' => 'Bearer ' . $this->token,
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
                $url = $invoice['invoice_lines']['url'];
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
                    return $data['items'][0]['label'];
                }
            }
        } catch (\Throwable $e) {
            // ignore or log the error as needed
        }

        return null; // Produit non trouvé
    }

}

