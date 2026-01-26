<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Photographer;
use Illuminate\Support\Facades\Http;
use App\Services\PennylaneService;
use App\Services\MailService;
use Illuminate\Support\Facades\Mail;
use App\Services\LogService;
use Illuminate\Support\Facades\Hash;

/**
 * @class PhotographerController
 * @brief Contrôleur de gestion des photographes
 * 
 * Gère toutes les opérations CRUD liées aux photographes,
 * incluant la récupération des informations et des identifiants.
 * 
 * @author SportPxl Team
 * @version 1.0.0
 * @date 2026-01-13
 */
class PhotographerController extends Controller
{
    /**
     * @var LogService $logService Service de journalisation
     */
    private LogService $logService;

    /**
     * @brief Constructeur du contrôleur
     * @param LogService $logService Injection du service de logs
     */
    public function __construct(LogService $logService)
    {
        $this->logService = $logService;
    }

    /**
     * @brief Récupère un photographe par son ID
     * 
     * Recherche et retourne les informations d'un photographe spécifique.
     * Retourne une erreur 404 si le photographe n'existe pas.
     * 
     * @param int $id Identifiant du photographe
     * @return \Illuminate\Http\JsonResponse Données du photographe ou message d'erreur
     */
    public function getPhotographer($id)
    {
        $photographer = Photographer::find($id);

        if (!$photographer)
        {
            return response()->json(['message' => 'Photographe non trouvé'], 404);
        }

        return response()->json($photographer);
    }
  
    /**
     * @brief Récupère la liste de tous les photographes
     * 
     * Retourne l'ensemble des photographes enregistrés dans la base de données.
     * En cas d'erreur, retourne un message d'erreur avec le code 500.
     * 
     * @return \Illuminate\Http\JsonResponse Liste des photographes ou message d'erreur
     */
    public function getPhotographers()
    {
        try {
            $photographers = DB::table('photographers')->get();
            
            return response()->json($photographers);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * @brief Récupère les identifiants d'un photographe par son nom
     * 
     * Recherche un photographe par son nom et retourne ses différents identifiants :
     * ID interne, client_id et pennylane_id.
     * 
     * @param string $name Nom du photographe à rechercher
     * @return \Illuminate\Http\JsonResponse Identifiants du photographe ou message d'erreur
     */
    public function getPhotographerIds($name)
    {   
        if (!$name) {
            return response()->json(['error' => 'Name parameter is required'], 400);
        }

        $photographer = DB::table('photographers')
            ->where('name', $name)
            ->first();
        
        if ($photographer) {
            return response()->json(['id' => $photographer->id, 'client_id' => $photographer->id, "pennylane_id" => $photographer->pennylane_id]);
        } else {
            return response()->json(['error' => 'Photographer not found'], 404);
        }
    }

    public function insertPhotographer(array $data)
    {
        try {
            $photographer = Photographer::create($data);
            return $photographer;
        } catch (\Throwable $e) {
            throw $e;
        }
    }

    public function createPhotographer(Request $request){
        try {
            $validated = $request->validate([
                'type' => 'required|string|in:individual,company',
                'aws_sub' => 'required|string|max:255|unique:photographers,aws_sub',
                'customer_stripe_id' => 'required|string|max:255',
                'fee_in_percent' => 'required|numeric|min:0|max:100',
                'fix_fee' => 'required|numeric|min:0',
                'email' => 'required|email|max:255',
                'phone' => 'nullable|string|max:20',
                'address' => 'required|string|max:255',
                'postal_code' => 'required|string|max:20',
                'city' => 'required|string|max:100',
                'country_alpha2' => 'required|string|size:2',
                'billing_iban' => 'nullable|string|max:34',
                'given_name' => 'required_if:type,individual|string|max:100',
                'family_name' => 'required_if:type,individual|string|max:100',
                'name' => 'required_if:type,company|string|max:255',
                'vat_number' => 'required_if:type,company|string|max:14',
                'password' => 'required|string|min:8',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        }

        $existingPhotographer = Photographer::where('email', $validated['email'])->first();
        if ($existingPhotographer) {
            return response()->json([
                'success' => false,
                'message' => 'Email already in use'
            ], 409);
        }

        $ignoredKeys = [
            'type', 'vat_number', 'password'
        ];

        $payload = [];
        if ($validated['type'] === 'individual') {
            $payload = [
                'type' => $validated['type'],
                'first_name' => $validated['given_name'],
                'last_name' => $validated['family_name'],
                'emails' => [$validated['email']],
                'phone' => $validated['phone'] ?? null,
                'billing_address' => [
                    'address' => $validated['address'],
                    'postal_code' => $validated['postal_code'],
                    'city' => $validated['city'],
                    'country_alpha2' => $validated['country_alpha2'],
                ],
                'billing_iban' => $validated['billing_iban'] ?? null,
            ];
        } else {
            $payload = [
                'type' => $validated['type'],
                'name' => $validated['name'],
                'vat_number' => $validated['vat_number'],
                'emails' => [$validated['email']],
                'phone' => $validated['phone'] ?? null,
                'billing_address' => [
                    'address' => $validated['address'],
                    'postal_code' => $validated['postal_code'],
                    'city' => $validated['city'],
                    'country_alpha2' => $validated['country_alpha2'],
                ],
                'billing_iban' => $validated['billing_iban'] ?? null,
            ];
        }

        $pennylaneService = new PennylaneService();

        try {
            $pennylaneResponse = $pennylaneService->createClient($payload);
            if ($pennylaneResponse === null) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pennylane API did not create the customer.'
                ], 400);
            }

            // Prepare data for insertion into the database
            $forInsertion = $this->cleanForInsertion($validated, $ignoredKeys);
            $forInsertion['pennylane_id'] = $pennylaneResponse['id'];
            
            try {
                $photographer = $this->insertPhotographer($forInsertion);
                
                return response()->json([
                    'success' => true,
                    'photographer' => $photographer
                ], 201);
            } catch (\Throwable $e) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to create photographer',
                    'error' => $e->getMessage(),
                ], 500);
            }

        } catch (\GuzzleHttp\Exception\ClientException $e) {
            $body = $e->getResponse() ? $e->getResponse()->getBody()->getContents() : $e->getMessage();
            return response()->json([
                'success' => false,
                'message' => 'Pennylane API error',
                'error' => $body,
            ], 400);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Unexpected error',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function deletePhotographer($id){
        try {
            $photographer = Photographer::find($id);
            if (!$photographer) {
                return response()->json([
                    'success' => false,
                    'message' => 'Photographer not found'
                ], 404);
            }

            // Update on pennylane to set first name and last name to "deleted_client"
            $pennylaneService = new PennylaneService();
            if($photographer->family_name && $photographer->given_name){
                $payload = [
                    'type' => 'individual',
                    'first_name' => 'deleted_client',
                    'last_name' => 'deleted_client',
                ];
            } else {
                $payload = [
                    'type' => 'company',
                    'name' => 'deleted_client',
                ];
            }

            $pennylaneResponse = $pennylaneService->updateClient($photographer->pennylane_id, $payload);
            
            if ($pennylaneResponse === null) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pennylane API did not update the customer.'
                ], 400);
            }

            $photographer->delete();

            return response()->json([
                'success' => true,
                'message' => 'Photographer deleted successfully'
            ], 200);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete photographer',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    private function cleanForInsertion(array $data, array $ignoredKeys, bool $isCreation = true): array
    {
        $cleaned = [];
        
        if ($isCreation) {
            $cleaned['nb_imported_photos'] = 0;
            $cleaned['total_limit'] = 100;
        }

        if (isset($data['password'])) {
            $cleaned['password'] = Hash::make($data['password']);
        }

        if ($data['type'] === 'individual') {
            if (isset($data['given_name']) && isset($data['family_name'])) {
                $cleaned['name'] = $data['given_name'] . ' ' . $data['family_name'];
            }
        } else {
            if (isset($data['given_name']) || isset($data['family_name'])) {
                $cleaned['given_name'] = null;
                $cleaned['family_name'] = null;
            }
        }

        foreach ($data as $key => $value) {
            if (!in_array($key, $ignoredKeys)) {
                switch ($key) {
                    case 'address':
                        $cleaned['street_address'] = $value;
                        break;
                    case 'city':
                        $cleaned['locality'] = $value;
                        break;
                    case 'country_alpha2':
                        $cleaned['country'] = $value;
                        break;
                    case 'billing_iban':
                        $cleaned['iban'] = $value;
                        break;
                    default:
                        $cleaned[$key] = $value;
                        break;
                }
            }
        }
        return $cleaned;
    }

    public function updatePhotographer(Request $request, $id){
        try {
            $validated = $request->validate([
                'type' => 'required|string|in:individual,company',
                'fee_in_percent' => 'nullable|numeric|min:0|max:100',
                'fix_fee' => 'nullable|numeric|min:0',
                'email' => 'nullable|email|max:255',
                'phone' => 'nullable|string|max:20',
                'address' => 'nullable|string|max:255',
                'postal_code' => 'nullable|string|max:20',
                'city' => 'nullable|string|max:100',
                'country_alpha2' => 'nullable|string|size:2',
                'billing_iban' => 'nullable|string|max:34',
                'given_name' => 'nullable:type,individual|string|max:100',
                'family_name' => 'nullable|string|max:100',
                'name' => 'nullable|string|max:255',
                'vat_number' => 'nullable|string|max:14',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        }
        // if email is being updated, check if it's already in use
        if (isset($validated['email'])) {
            $existingPhotographer = Photographer::where('email', $validated['email'])
                ->where('id', '!=', $id)
                ->first();
            if ($existingPhotographer) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email already in use'
                ], 409);
            }
        }

        $ignoredKeys = [
            'type', 'vat_number'
        ];
        $payload = [];
        if ($validated['type'] === 'individual') {
            $payload = [
                'type' => $validated['type'],
            ];
            $payload += array_filter([
                'first_name' => $validated['given_name'] ?? null,
                'last_name' => $validated['family_name'] ?? null,
                'emails' => isset($validated['email']) ? [$validated['email']] : null,
                'phone' => $validated['phone'] ?? null,
                'billing_address' => array_filter([
                    'address' => $validated['address'] ?? null,
                    'postal_code' => $validated['postal_code'] ?? null,
                    'city' => $validated['city'] ?? null,
                    'country_alpha2' => $validated['country_alpha2'] ?? null,
                ]),
                'billing_iban' => $validated['billing_iban'] ?? null,
            ], fn($value) => $value !== null && $value !== []);
        } else {
            $payload = [
                'type' => $validated['type'],
            ];
            $payload += array_filter([
                'name' => $validated['name'] ?? null,
                'vat_number' => $validated['vat_number'] ?? null,
                'emails' => isset($validated['email']) ? [$validated['email']] : null,
                'phone' => $validated['phone'] ?? null,
                'billing_address' => array_filter([
                    'address' => $validated['address'] ?? null,
                    'postal_code' => $validated['postal_code'] ?? null,
                    'city' => $validated['city'] ?? null,
                    'country_alpha2' => $validated['country_alpha2'] ?? null,
                ]),
                'billing_iban' => $validated['billing_iban'] ?? null,
            ], fn($value) => $value !== null && $value !== []);
        }

        $pennylaneService = new PennylaneService();

        try {
            $photographer = Photographer::find($id);
            if (!$photographer) {
                return response()->json([
                    'success' => false,
                    'message' => 'Photographer not found'
                ], 404);
            }

            $pennylaneResponse = $pennylaneService->updateClient($photographer->pennylane_id, $payload);
            if ($pennylaneResponse === null) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pennylane API did not update the customer.'
                ], 400);
            }

            // Prepare data for update into the database
            $forUpdate = $this->cleanForInsertion($validated, $ignoredKeys, false);
            
            try {
                $photographer->update($forUpdate);
                
                return response()->json([
                    'success' => true,
                    'photographer' => $photographer
                ], 200);
            } catch (\Throwable $e) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to update photographer',
                    'error' => $e->getMessage(),
                ], 500);
            }

        } catch (\GuzzleHttp\Exception\ClientException $e) {
            $body = $e->getResponse() ? $e->getResponse()->getBody()->getContents() : $e->getMessage();
            return response()->json([
                'success' => false,
                'message' => 'Pennylane API error',
                'error' => $body,
            ], 400);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Unexpected error',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
