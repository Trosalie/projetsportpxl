<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class PhotographerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'aws_sub' => $this->faker->uuid,  // Pour générer un UUID
            'email' => $this->faker->unique()->safeEmail,
            'family_name' => $this->faker->lastName,
            'given_name' => $this->faker->firstName,
            'name' => $this->faker->name,
            'customer_stripe_id' => $this->faker->uuid,  // Pour un ID Stripe unique
            'nb_imported_photos' => $this->faker->numberBetween(0, 1000),  // Nombre d'images importées
            'total_limit' => $this->faker->numberBetween(500, 5000),  // Limite totale (ex: sur un abonnement)
            'fee_in_percent' => $this->faker->randomFloat(2, 5, 30),  // Exemple de pourcentage de commission (5% à 30%)
            'fix_fee' => $this->faker->randomFloat(2, 10, 100),  // Exemple de frais fixes
            'street_address' => $this->faker->streetAddress,
            'locality' => $this->faker->city,
            'country' => $this->faker->country,
            'iban' => $this->faker->iban,  // Génère un IBAN aléatoire
            'password' => bcrypt('password123'),  // Mot de passe chiffré
        ];
    }
}
