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

    public function createPhotographer(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:photographers',
            'pennylane_id' => 'nullable|integer|unique:photographers',
        ]);

        $photographer = Photographer::create($data);

        return response()->json($photographer, 201);
    }
}
