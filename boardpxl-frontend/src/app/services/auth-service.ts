import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Photographer } from '../models/photographer.model';

/**
 * @interface LoginResponse
 * @brief Réponse de l'API lors de la connexion
 * 
 * Structure de données retournée par l'API après une authentification réussie.
 */
interface LoginResponse {
  user: Photographer;
  token: string;
  is_first_login: boolean;
}

/**
 * @class AuthService
 * @brief Service de gestion de l'authentification
 * 
 * Gère toutes les opérations liées à l'authentification des utilisateurs :
 * connexion, déconnexion, gestion des tokens JWT et des données utilisateur.
 * Utilise RxJS Subjects pour notifier les composants des changements d'état.
 * 
 * @author SportPxl Team
 * @version 1.0.0
 * @date 2026-01-13
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  /**
   * @var apiUrl URL de base de l'API backend
   */
  private apiUrl = `${environment.apiUrl}`;
  /**
   * @var logoutSubject Subject pour notifier la déconnexion
   */
  private logoutSubject = new Subject<void>();
  /**
   * @var logout$ Observable pour s'abonner aux événements de déconnexion
   */
  public logout$ = this.logoutSubject.asObservable();
  /**
   * @var loginSubject Subject pour notifier la connexion
   */
  private loginSubject = new Subject<void>();
  /**
   * @var login$ Observable pour s'abonner aux événements de connexion
   */
  public login$ = this.loginSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * @brief Authentifie un utilisateur
   * 
   * Envoie les identifiants à l'API pour authentification.
   * Retourne un Observable contenant le token JWT et les données utilisateur.
   * 
   * @param email Adresse email de l'utilisateur
   * @param password Mot de passe de l'utilisateur
   * @returns Observable<LoginResponse> Réponse contenant token et données utilisateur
   */
  login(email: string, password: string): Observable<LoginResponse> {
    const body = {
      email: email,
      password: password
    };
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, body);
  }

  /**
   * @brief Récupère les données de l'utilisateur authentifié
   * 
   * Effectue une requête authentifiée vers l'API pour obtenir
   * les informations à jour de l'utilisateur connecté.
   * 
   * @returns Observable<Photographer> Données du photographe connecté
   */
  getApiUser(): Observable<Photographer> {
    const token = this.getToken();
    return this.http.get<Photographer>(`${this.apiUrl}/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
  }

  /**
   * @brief Sauvegarde le token JWT et les données utilisateur
   * 
   * Enregistre le token d'authentification et les informations utilisateur
   * dans le localStorage. Déclenche un événement de connexion.
   * 
   * @param token Token JWT reçu de l'API
   * @param user Données du photographe connecté
   * @param isFirstLogin Indicateur de première connexion
   * @returns void
   */
  saveToken(token: string, user: Photographer, isFirstLogin: boolean = false): void {
    localStorage.setItem('api_token', token);
    localStorage.setItem('is_first_login', isFirstLogin.toString());
    this.setUser(user);
    this.loginSubject.next();
  }

  /**
   * @brief Récupère l'utilisateur depuis le localStorage
   * 
   * Lit et parse les données utilisateur stockées localement.
   * 
   * @returns Photographer|null Données du photographe ou null si non connecté
   */
  getUser(): Photographer | null {
    const userData = localStorage.getItem('user');
    if (userData) {
      return JSON.parse(userData) as Photographer;
    }
    return null;
  }

  /**
   * @brief Enregistre les données utilisateur dans le localStorage
   * 
   * @param userData Données du photographe à sauvegarder
   * @returns void
   */
  setUser(userData: Photographer){
    localStorage.setItem('user', JSON.stringify(userData));
  }

  /**
   * @brief Récupère le token JWT depuis le localStorage
   * 
   * @returns string|null Token JWT ou null si non connecté
   */
  getToken(): string | null {
    return localStorage.getItem('api_token');
  }

  /**
   * @brief Déconnecte l'utilisateur
   * 
   * Notifie l'API de la déconnexion, supprime le token et les données
   * utilisateur du localStorage, et déclenche un événement de déconnexion.
   * 
   * @returns void
   */
  logout() {
    this.logoutSubject.next();
    this.http.post(`${this.apiUrl}/logout`, {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
        'Accept': 'application/json'
      }
    }).subscribe();
    localStorage.removeItem('api_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_role');
    localStorage.removeItem('is_first_login');
  }

  /**
   * @brief Récupère le flag de première connexion
   * 
   * @returns boolean Vrai si c'est la première connexion
   */
  isFirstLogin(): boolean {
    return localStorage.getItem('is_first_login') === 'true';
  }

  /**
   * @brief Efface le flag de première connexion
   * 
   * @returns void
   */
  clearFirstLoginFlag(): void {
    localStorage.removeItem('is_first_login');
  }

  /**
   * @brief Envoie un email de réinitialisation de mot de passe
   * 
   * Envoie une requête à l'API pour initier le processus de réinitialisation 
   * @param email Adresse email de l'utilisateur 
   * @returns Observable<any> Réponse de l'API
   */
  sendPasswordResetEmail(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/password/forgot`, { email });
  }

  /**
   * @brief Réinitialise le mot de passe avec un token
   * 
   * @param email Adresse email de l'utilisateur
   * @param token Token de réinitialisation
   * @param password Nouveau mot de passe
   * @param password_confirmation Confirmation du nouveau mot de passe
   * @returns Observable<any> Réponse de l'API
   */
  resetPassword(email: string, token: string, password: string, password_confirmation: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/password/reset`, {
      email,
      token,
      password,
      password_confirmation
    });
  }

}
