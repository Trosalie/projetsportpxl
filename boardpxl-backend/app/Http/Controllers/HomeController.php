<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

/**
 * @class HomeController
 * @brief Contrôleur de la page d'accueil
 * 
 * Gère l'affichage de la page d'accueil pour les utilisateurs authentifiés.
 * 
 * @author SportPxl Team
 * @version 1.0.0
 * @date 2026-01-13
 */
class HomeController extends Controller
{
    /**
     * @brief Crée une nouvelle instance du contrôleur
     * 
     * Applique le middleware d'authentification pour protéger toutes les routes.
     * 
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * @brief Affiche le tableau de bord de l'application
     * 
     * Retourne la vue principale (home) pour l'utilisateur authentifié.
     * 
     * @return \Illuminate\Contracts\Support\Renderable Vue du tableau de bord
     */
    public function index()
    {
        return view('home');
    }
}
