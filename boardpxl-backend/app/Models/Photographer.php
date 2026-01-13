<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Ramsey\Collection\Collection;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\HasApiTokens;

/**
 * @class Photographer
 * @brief Modèle représentant un photographe dans la plateforme BoardPxl
 * 
 * Cette classe gère les informations des photographes utilisant la plateforme.
 * Elle hérite de Authenticatable pour la gestion de l'authentification et utilise
 * HasApiTokens pour l'authentification via Sanctum.
 * 
 * @author SportPxl Team
 * @version 1.0.0
 * @date 2026-01-13
 */
class Photographer extends Authenticatable
{
    use HasFactory, HasApiTokens;

    /**
     * @var array $fillable Attributs assignables en masse
     * Liste des colonnes de la table qui peuvent être remplies via mass assignment
     */
    protected $fillable = [
        'aws_sub',
        'email',
        'family_name',
        'given_name',
        'name',
        'customer_stripe_id',
        'nb_imported_photos',
        'total_limit',
        'fee_in_percent',
        'fix_fee',
        'street_address',
        'postal_code',
        'locality',
        'country',
        'iban',
        'password',
        'pennylane_id'
    ];

    /**
     * @var array $hidden Attributs cachés lors de la sérialisation
     * Ces attributs ne seront pas inclus dans les réponses JSON/Array
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * @var array $casts Conversions de types pour les attributs
     * Définit les types de données pour la conversion automatique
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    /**
     * @brief Mutateur pour l'attribut password
     * 
     * Hash automatiquement le mot de passe si nécessaire avant stockage en base de données.
     * Vérifie si le mot de passe nécessite un nouveau hash avant de le hasher.
     * 
     * @param string $value Mot de passe en clair ou déjà hashé
     * @return void
     */
    public function setPasswordAttribute($value)
    {
        $this->attributes['password'] = Hash::needsRehash($value) ? Hash::make($value) : $value;
    }

    /**
     * @brief Relation One-to-Many avec InvoiceCredit
     * 
     * Retourne toutes les factures de crédit associées à ce photographe.
     * Un photographe peut avoir plusieurs factures de crédit.
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function invoicesCredit()
    {
        return $this->hasMany(InvoiceCredit::class);
    }

    /**
     * @brief Relation One-to-Many avec InvoicePayment
     * 
     * Retourne toutes les factures de versement de CA associées à ce photographe.
     * Un photographe peut avoir plusieurs factures de versement.
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function invoicesPayment()
    {
        return $this->hasMany(InvoicePayment::class);
    }

    /**
     * @brief Relation One-to-Many avec MailLogs
     * 
     * Retourne tous les logs d'emails envoyés par ce photographe.
     * Un photographe peut avoir plusieurs logs d'emails.
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function mailLogs()
    {
        return $this->hasMany(MailLogs::class, 'sender_id');
    }

    /**
     * @brief Récupère les données de profil d'un photographe par email
     * 
     * Recherche et retourne les informations essentielles du profil d'un photographe
     * basé sur son adresse email. Inclut les données personnelles et limites d'utilisation.
     * 
     * @param string $email Adresse email du photographe
     * @return object|null Objet contenant les données du profil ou null si non trouvé
     */
    public function findProfilData(string $email)
    {
        return DB::table('photographers')
            ->select('email', 'family_name', 'given_name', 'name', 'nb_imported_photos', 'total_limit', 'street_address', 'postal_code', 'locality', 'country')
            ->where('email', $email)
            ->first();
    }
}
