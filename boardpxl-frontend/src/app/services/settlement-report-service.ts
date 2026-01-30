import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpHeadersService } from './http-headers.service';

/**
 * @interface SettlementReport
 * @brief Interface représentant un relevé d'encaissement
 */
export interface SettlementReport {
  id?: number;
  photographer_id: number;
  amount: number;
  commission: number;
  period_start_date: string;
  period_end_date: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * @interface TurnoverCalculation
 * @brief Interface pour le calcul du chiffre d'affaires
 */
export interface TurnoverCalculation {
  turnover: number;
  start_date: string;
}

/**
 * @class SettlementReportService
 * @brief Service de gestion des relevés d'encaissement
 * 
 * Gère toutes les opérations liées aux relevés d'encaissement :
 * récupération du dernier relevé, calcul du CA et création de nouveaux relevés.
 * 
 * @author SportPxl Team
 * @version 1.0.0
 * @date 2026-01-28
 */
@Injectable({
  providedIn: 'root',
})
export class SettlementReportService {
  constructor(
    private http: HttpClient,
    private headersService: HttpHeadersService
  ) {}

  /**
   * @brief Récupère le dernier relevé d'encaissement d'un photographe
   * 
   * @param photographerId ID du photographe
   * @returns Observable avec le dernier relevé ou null
   */
  getLastSettlementReport(photographerId: number): Observable<any> {
    const body = { photographer_id: photographerId };
    return this.http.post(
      `${environment.apiUrl}/settlement-report/last`,
      body,
      this.headersService.getAuthHeaders()
    );
  }

  /**
   * @brief Calcule le chiffre d'affaires depuis une date donnée
   * 
   * @param photographerId ID du photographe
   * @param startDate Date de début (format ISO)
   * @returns Observable avec le CA calculé
   */
  calculateTurnoverSinceDate(
    photographerId: number,
    startDate: string
  ): Observable<any> {
    const body = {
      photographer_id: photographerId,
      start_date: startDate,
    };
    return this.http.post(
      `${environment.apiUrl}/settlement-report/calculate-turnover`,
      body,
      this.headersService.getAuthHeaders()
    );
  }

  /**
   * @brief Crée un nouveau relevé d'encaissement
   * 
   * @param report Données du relevé
   * @returns Observable avec le relevé créé
   */
  createSettlementReport(report: SettlementReport): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}/settlement-report/create`,
      report,
      this.headersService.getAuthHeaders()
    );
  }
}
