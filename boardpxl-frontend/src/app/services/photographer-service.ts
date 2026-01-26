import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Photographer } from '../models/photographer.model';
import { HttpHeadersService } from './http-headers.service';

/**
 * @class PhotographerService
 * @brief Service de gestion des photographes
 * 
 * Gère les opérations liées aux photographes : récupération de la liste,
 * filtrage et recherche par nom. Utilise un cache local pour optimiser les performances.
 * 
 * @author SportPxl Team
 * @version 1.0.0
 * @date 2026-01-13
 */
@Injectable({
  providedIn: 'root',
})
export class PhotographerService {
  /**
   * @var photographers Cache local de tous les photographes
   */
  private photographers: Photographer[] = [];
  /**
   * @var filteredPhotographers Liste des photographes filtrés
   */
  private filteredPhotographers: Photographer[] = [];

  constructor(private http: HttpClient, private headersService: HttpHeadersService) {
  }

  /**
   * @brief Récupère la liste des photographes depuis l'API
   * 
   * @returns Observable<Photographer[]> Liste des photographes
   */
  getPhotographers(): Observable<Photographer[]> {
    return this.http.get<Photographer[]>(`${environment.apiUrl}/photographers`, this.headersService.getAuthHeaders());
  }

  /**
   * @brief Force la récupération des photographes et met à jour le cache
   * 
   * Récupère la liste depuis l'API et met à jour le cache local.
   * 
   * @returns Observable<Photographer[]> Liste des photographes
   */
  forceGetPhotographers(): Observable<Photographer[]> {
    return this.http.get<Photographer[]>(`${environment.apiUrl}/photographers`, this.headersService.getAuthHeaders()).pipe(
      tap(data => {
        this.photographers = data;
      })
    );
  }

  /**
   * @brief Définit la liste des photographes filtrés
   * 
   * @param filtered Liste filtrée de photographes
   * @returns void
   */
  setFilteredPhotographers(filtered: Photographer[]) {
    this.filteredPhotographers = filtered;
  }

  /**
   * @brief Retourne la liste des photographes filtrés
   * 
   * @returns Photographer[] Liste filtrée de photographes
   */
  getFilteredPhotographers(): Photographer[] {
    return this.filteredPhotographers;
  }

  /**
   * @brief Récupère les identifiants d'un photographe par son nom
   * 
   * Recherche un photographe par son nom et retourne ses différents identifiants.
   * 
   * @param name Nom du photographe à rechercher
   * @returns Observable<any> Identifiants du photographe
   */
  getPhotographerIdsByName(name: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/photographer-ids/${encodeURIComponent(name)}`, this.headersService.getAuthHeaders());
  }

  /**
   * @brief Crée un nouveau photographe via l'API
   * 
   * Envoie une requête POST à l'API pour créer un nouveau photographe
   * 
   * @param payload Données du photographe à créer
   * @returns Observable<any> Réponse de l'API
   */
  createPhotographer(payload: any): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}/photographer`,
      payload,
      this.headersService.getAuthHeaders()
    );
  }

  /**
   * @brief Récupère un photographe par son ID
   *
   * @param id Identifiant du photographe
   * @returns Observable<any> Photographe
   */
  getPhotographer(id: number | string): Observable<any> {
    return this.http.get(
      `${environment.apiUrl}/photographer/${id}`,
      this.headersService.getAuthHeaders()
    );
  }

  /**
   * @brief Met à jour un photographe via l'API
   *
   * Envoie une requête PUT à l'API pour mettre à jour un photographe existant
   *
   * @param id Identifiant du photographe
   * @param payload Données à mettre à jour
   * @returns Observable<any> Réponse de l'API
   */
  updatePhotographer(id: number, payload: any): Observable<any> {
    return this.http.put(
      `${environment.apiUrl}/photographer/${id}`,
      payload,
      this.headersService.getAuthHeaders()
    );
  }
}
