<?php

namespace Database\Seeders;

use GuzzleHttp\Client;
use App\Services\PennylaneService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use SebastianBergmann\CodeCoverage\Report\PHP;

class PhotographerSeeder extends Seeder
{
    private const DELIMITEUR_CSV = ',';
    private const ENCLOSURE_CSV = '"';
    private const ESCAPE_CSV = "\0";
    private const CHEMIN_FICHIER_CSV = 'seeders/Photographes.csv';
    
    private const CHAMPS_OBLIGATOIRES = ['aws sub', 'email', 'name'];
    
    private Client $client;
    private array $data = [];

    /**
     * Exécuter le seeder
     *
     * @return void
     */
    public function run(): void
    {
        $service = new PennylaneService();
        $this->client = $service->getHttpClient();
        $response = $this->client->get('customers?sort=-id');
        $data = json_decode($response->getBody()->getContents(), true);
        $this->data = $data["items"] ?? [];

        while($data["has_more"] ?? false) {
            $response = $this->client->get('customers?sort=-id&cursor=' . $data["next_cursor"]);
            $data = json_decode($response->getBody()->getContents(), true);
            $this->data = array_merge($this->data, $data["items"] ?? []);
            usleep(500000); // Faire 2 appels par seconde pour éviter de saturer l'API Pennylane
        }

        echo "Fetched " . count($this->data) . " customers from Pennylane API." . PHP_EOL;

        $photographes = $this->creerListePhotographes(database_path(self::CHEMIN_FICHIER_CSV));
        $this->insererPhotographesUniques($photographes);
    }

    /**
     * Créer une liste de photographes à partir d'un fichier CSV
     * 
     * @param string $cheminCSV
     * @return array
     * @throws \RuntimeException
     */
    private function creerListePhotographes(string $cheminCSV): array
    {
        $handle = $this->ouvrirFichierCSV($cheminCSV);
        $mappingColonnes = $this->creerMappingColonnes($handle);
        $photographes = $this->lireDonneesCSV($handle, $mappingColonnes);
        
        fclose($handle);
        
        return $photographes;
    }

    /**
     * Ouvrir le fichier CSV
     * 
     * @param string $cheminCSV
     * @return resource
     * @throws \RuntimeException
     */
    private function ouvrirFichierCSV(string $cheminCSV)
    {
        $handle = fopen($cheminCSV, 'r');
        
        if ($handle === false) {
            throw new \RuntimeException("Impossible d'ouvrir le fichier CSV : {$cheminCSV}");
        }
        
        return $handle;
    }

    /**
     * Créer un mapping des colonnes à partir des en-têtes
     * 
     * @param resource $handle
     * @return array
     */
    private function creerMappingColonnes($handle): array
    {
        $entetes = fgetcsv($handle, 0, self::DELIMITEUR_CSV, self::ENCLOSURE_CSV, self::ESCAPE_CSV);
        
        $mappingColonnes = [];
        foreach ($entetes as $index => $entete) {
            $mappingColonnes[$entete] = $index;
        }
        
        return $mappingColonnes;
    }

    /**
     * Lire les données du CSV et créer les tableaux de photographes
     * 
     * @param resource $handle
     * @param array $mappingColonnes
     * @return array
     */
    private function lireDonneesCSV($handle, array $mappingColonnes): array
    {
        $photographes = [];
        $nombreColonnes = count($mappingColonnes);
        
        while (($donnees = fgetcsv($handle, 0, self::DELIMITEUR_CSV, self::ENCLOSURE_CSV, self::ESCAPE_CSV)) !== false) {
            if (!$this->estLigneValide($donnees, $mappingColonnes, $nombreColonnes)) {
                continue;
            }
            
            $photographes[] = $this->creerPhotographe($donnees, $mappingColonnes);
        }
        
        return $photographes;
    }

    /**
     * Vérifier si la ligne CSV est valide
     * 
     * @param array $donnees
     * @param array $mappingColonnes
     * @param int $nombreColonnes
     * @return bool
     */
    private function estLigneValide(array $donnees, array $mappingColonnes, int $nombreColonnes): bool
    {
        if (count($donnees) < $nombreColonnes) {
            return false;
        }
        
        foreach (self::CHAMPS_OBLIGATOIRES as $champ) {
            if (!isset($donnees[$mappingColonnes[$champ]]) || empty($donnees[$mappingColonnes[$champ]])) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * Récupérer ou créer un client Pennylane à partir de l'email
     * 
     * @param array $donnees
     * @return int|null
     */
    private function getOrCreatePennylaneIdFromEmail(array $donnees): ?int
    {
        $email = strtolower(trim($donnees['email']));

        $photographer = collect($this->data)
            ->first(function ($item) use ($email) {
                $emails = array_map(
                    fn ($e) => strtolower(trim($e)),
                    $item['emails'] ?? []
                );
                // echo "Checking emails: " . implode(", ", $emails) . PHP_EOL;
                // echo "Against email: " . $email . PHP_EOL;
                return in_array($email, $emails, true);
            });

            echo $donnees['email'] . PHP_EOL;

        if(!$photographer || empty($photographer['id'])) {
            $endpoint = 'individual_customers';

            if(empty($donnees['given_name']) && empty($donnees['family_name'])) {
                $endpoint = 'company_customers';
            }

            // Nettoyer les données avant l'envoi -> remplacer les ';' par des ''
            $donnees = array_map(function ($value) {
                if (is_string($value)) {
                    return str_replace(';', '', $value);
                }
                return $value;
            }, $donnees);

            if(empty($donnees['family_name'])) {
                $donnees['family_name'] = '_';
            }
            if(empty($donnees['given_name'])) {
                $donnees['given_name'] = '_';
            }
            if(empty($donnees['name'])) {
                $donnees['name'] = $donnees['given_name'] . ' ' . $donnees['family_name'];
            }

            // Parser le champ country pour ne garder que le code pays (par défaut fr_FR, sinon en_GB ou de_DE)
            if (strtolower($donnees['country']) == 'france' || strtolower($donnees['country']) == 'fr_fr' || strtolower($donnees['country']) == 'fr'){
                $donnees['country'] = 'FR';
            }
            elseif (strtolower($donnees['country']) == 'royaume-uni' || strtolower($donnees['country']) == 'england' || strtolower($donnees['country']) == 'uk' || strtolower($donnees['country']) == 'gb' || strtolower($donnees['country']) == 'en_gb'){
                $donnees['country'] = 'GB';
            }
            elseif (strtolower($donnees['country']) == 'allemagne' || strtolower($donnees['country']) == 'germany' || strtolower($donnees['country']) == 'de' || strtolower($donnees['country']) == 'de_de'){
                $donnees['country'] = 'DE';
            }
            else {
                $donnees['country'] = 'FR';
            }

            // afficher le photographe dans la console
            echo "Photographer: " . json_encode($donnees) . "\n";

            $json = [
                'emails' => [$donnees['email']],
                'billing_address' => [
                    'address' => $donnees['street_address'] ?? '',
                    'postal_code' => $donnees['postal_code'] ?? '',
                    'city' => $donnees['locality'] ?? '',
                    'country_alpha2' => $donnees['country'] ?? 'FR',
                ],
                'delivery_address' => [
                    'address' => $donnees['street_address'] ?? '',
                    'postal_code' => $donnees['postal_code'] ?? '',
                    'city' => $donnees['locality'] ?? '',
                    'country_alpha2' => $donnees['country'] ?? 'FR',
                ],
                'billing_iban' => 'FR1010096000307323346714U91',

            ];

            if($endpoint === 'individual_customers') {
                $json['first_name'] = $donnees['given_name'] ?? '';
                $json['last_name'] = $donnees['family_name'] ?? '';
            } else {
                $json['name'] = $donnees['name'] ?? '';
            }

            $response = $this->client->post($endpoint, ['json' => $json]);
            $created = json_decode($response->getBody()->getContents(), true);
  
        }
        return $created['id'] ?? $photographer['id'] ?? null;
    }

    /**
     * Créer un tableau de photographe à partir d'une ligne CSV
     * 
     * @param array $donnees
     * @param array $mappingColonnes
     * @return array
     */
    private function creerPhotographe(array $donnees, array $mappingColonnes): array
    {
        return [
            'aws_sub' => $donnees[$mappingColonnes['aws sub']],
            'email' => $donnees[$mappingColonnes['email']],
            'family_name' => !empty($donnees[$mappingColonnes['family name']]) ? $donnees[$mappingColonnes['family name']] : null,
            'given_name' => !empty($donnees[$mappingColonnes['given name']]) ? $donnees[$mappingColonnes['given name']] : null,
            'name' => $donnees[$mappingColonnes['name']],
            'customer_stripe_id' => !empty($donnees[$mappingColonnes['customer stripe id']]) ? $donnees[$mappingColonnes['customer stripe id']] : null,
            'nb_imported_photos' => isset($donnees[$mappingColonnes['nb imported photos']]) ? (int)$donnees[$mappingColonnes['nb imported photos']] : 0,
            'total_limit' => isset($donnees[$mappingColonnes['total limit']]) ? (int)$donnees[$mappingColonnes['total limit']] : 0,
            'fee_in_percent' => isset($donnees[$mappingColonnes['fee in percent']]) ? (float)$donnees[$mappingColonnes['fee in percent']] : 0.0,
            'fix_fee' => isset($donnees[$mappingColonnes['fix fee']]) ? (float)$donnees[$mappingColonnes['fix fee']] : 0.0,
            'street_address' => !empty($donnees[$mappingColonnes['street address']]) ? $donnees[$mappingColonnes['street address']] : null,
            'postal_code' => !empty($donnees[$mappingColonnes['postal code']]) ? $donnees[$mappingColonnes['postal code']] : null,
            'locality' => !empty($donnees[$mappingColonnes['locality']]) ? $donnees[$mappingColonnes['locality']] : null,
            'country' => !empty($donnees[$mappingColonnes['country']]) ? $donnees[$mappingColonnes['country']] : null,
            'iban' => !empty($donnees[$mappingColonnes['iban']]) ? $donnees[$mappingColonnes['iban']] : null,
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    /**
     * Insérer les photographes uniques (sans doublons)
     * 
     * @param array $photographes
     * @return void
     */
    private function insererPhotographesUniques(array $photographes): void
    {
        $emailsVus = [];
        $awsSubsVus = [];

        foreach ($photographes as $photographe) {
            if (isset($emailsVus[$photographe['email']])) {
                continue;
            }
            
            if (isset($awsSubsVus[$photographe['aws_sub']])) {
                continue;
            }
            
            $photographe['pennylane_id'] = $this->getOrCreatePennylaneIdFromEmail(
            [
                'email' => $photographe['email'],
                'street_address' => $photographe['street_address'],
                'postal_code' => $photographe['postal_code'],
                'locality' => $photographe['locality'],
                'country' => $photographe['country'],
                'given_name' => $photographe['given_name'],
                'family_name' => $photographe['family_name'],
                'name' => $photographe['name'],
            ]
        );

            $emailsVus[$photographe['email']] = true;
            $awsSubsVus[$photographe['aws_sub']] = true;
            
            DB::table('photographers')->insert($photographe);
            // Faire 2 appels par seconde pour éviter de saturer l'API Pennylane
            usleep(500000);
        }
    }
}
