<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class PhotographerSeeder extends Seeder
{
    private const DELIMITEUR_CSV = ',';
    private const ENCLOSURE_CSV = '"';
    private const ESCAPE_CSV = "\0";
    private const CHEMIN_FICHIER_CSV = 'seeders/Photographes.csv';

    private const CHAMPS_OBLIGATOIRES = ['aws sub', 'email', 'name'];

    /**
     * Exécuter le seeder
     *
     * @return void
     */
    public function run(): void
    {
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
            'password' => Hash::make('Google@123?'),
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

            $emailsVus[$photographe['email']] = true;
            $awsSubsVus[$photographe['aws_sub']] = true;

            DB::table('photographers')->insert($photographe);
        }
    }
}
