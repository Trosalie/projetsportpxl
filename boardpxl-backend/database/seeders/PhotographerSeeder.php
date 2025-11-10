<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PhotographerSeeder extends Seeder
{

    /**
     * Créer une liste de photographes à partir d'un fichier CSV
     * @param string $cheminCSV
     * @return array
     */
    private function creerListePhotographes(string $cheminCSV): array
    {
        $photographes = [];
        
        if (($handle = fopen($cheminCSV, 'r')) !== false) {
            while (($data = fgetcsv($handle, 10, ',')) !== false) {
                $photographes[] = [
                    'aws_sub' => $data[0],
                    'email' => $data[1],
                    'family_name' => $data[2],
                    'given_name' => $data[3],
                    'name' => $data[4],
                    'customer_stripe_id' => $data[5],
                    'nb_imported_photos' => (int)$data[6],
                    'total_limit' => (int)$data[7],
                    'fee_in_percent' => (float)$data[8],
                    'fix_fee' => (float)$data[9],
                    'street_address' => $data[10],
                    'postal_code' => $data[11],
                    'locality' => $data[12],
                    'country' => $data[13],
                    'iban' => $data[14],
                ];
            }
            fclose($handle);
        }

        return $photographes;
    }

    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {

        $photographes = $this->creerListePhotographes(database_path('Photographes.csv'));

        DB::table('photographers')->insert($photographes);
    }
}
