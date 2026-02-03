import { Injectable } from '@angular/core';
import { InvoicePayment } from '../models/invoice-payment.model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Invoice } from '../models/invoice.model';
import { environment } from '../../environments/environment.development';
import { HttpHeadersService } from './http-headers.service';
import { InvoiceCredit } from '../models/invoice-credit.model';
import { InvoiceSubscription } from '../models/invoice-subscription.model';

/**
 * @class InvoiceService
 * @brief Service de gestion des factures
 *
 * Gère toutes les opérations liées aux factures : récupération,
 * création et insertion de factures de crédits et de versements.
 *
 * @author SportPxl Team
 * @version 1.0.0
 * @date 2026-01-13
 */
@Injectable({
  providedIn: 'root',
})
export class InvoiceService {

  /**
   * Initializes the InvoiceService with HTTP and header utilities.
   *
   * @param http Angular HttpClient used to perform HTTP requests to the invoice API.
   * @param headersService Service that provides authenticated HTTP headers for API calls.
   */
  constructor(private http: HttpClient, private headersService: HttpHeadersService) {
  }

  /**
   * Get all invoices from a specific client
   *
   * @param string clientId
   * @return Observable<Invoice[]>
   * */
  getInvoicesByClient(clientId: string): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${environment.apiUrl}/invoices-client/${clientId}`, this.headersService.getAuthHeaders());
  }

  /**
   *
   *
   * @param Invoice invoice
   * @return Observable<string[]>
   * */
  getProductFromInvoice(invoice: InvoiceCredit): Observable<string[]> {
    return this.http.get<string[]>(`${environment.apiUrl}/invoice-product/${invoice.number}`, this.headersService.getAuthHeaders());
  }

  /**
   * Call the api to get all payment invoices from a specific photographer
   *
   * @param number photographerId
   * @return Observable<InvoicePayment[]>
   * */
  getInvoicesPaymentByPhotographer(photographerId: number): Observable<InvoicePayment[]> {
    return this.http.get<InvoicePayment[]>(`${environment.apiUrl}/invoices-payment/${photographerId}`, this.headersService.getAuthHeaders());
  }

  getInvoicesSubscriptionByPhotographer(photographerId: number): Observable<InvoiceSubscription[]> {
    return this.http.get<InvoiceSubscription[]>(`${environment.apiUrl}/invoices-subscription/${photographerId}`, this.headersService.getAuthHeaders());
  }

  /**
   * Call the api to get all credit invoices from a specific photographer
   *
   * @param number photographerId
   * @return Observable<InvoicePayment[]>
   * */
  getInvoicesCreditByPhotographer(photographerId: number): Observable<InvoicePayment[]> {
    return this.http.get<InvoicePayment[]>(`${environment.apiUrl}/invoices-credit/${photographerId}`, this.headersService.getAuthHeaders());
  }

  /**
   * Call the api to create a new credit invoice for a photographer
   *
   * @param any body
   * @return Observable<any>
   * */
  createCreditsInvoice(body: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/create-credits-invoice-client`, body, this.headersService.getAuthHeaders());
  }

  /**
   * Call the api to create a new payment invoice for a photographer
   *
   * @param any body
   * @return Observable<any>
   * */
  createTurnoverPaymentInvoice(body: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/create-turnover-invoice-client`, body, this.headersService.getAuthHeaders());
  }

  createSubscriptionInvoice(body: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/create-subscription-invoice-client`, body, this.headersService.getAuthHeaders());
  }

  /**
   * Call the api to insert a new payment invoice for a photographer
   *
   * @param any body
   * @return Observable<any>
   * */
  insertTurnoverInvoice(body: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/insert-turnover-invoice`, body, this.headersService.getAuthHeaders());
  }

  /**
   * Call the api to insert a new subcripton invoice for a photographer
   *
   * @param any body
   * @return Observable<any>
   * */
  insertSubscriptionInvoice(body: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/insert-subscription-invoice`, body, this.headersService.getAuthHeaders());
  }

  /**
   * Call the api to insert a new credit invoice for a photographer
   *
   * @param any body
   * @return Observable<any>
   * */
  insertCreditsInvoice(body: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/insert-credits-invoice`, body, this.headersService.getAuthHeaders());
  }

  getCreditsFinancialInfo(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/invoice-credits-financial-info`, this.headersService.getAuthHeaders());
  }

  getTurnoverFinancialInfo(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/invoice-turnover-financial-info`, this.headersService.getAuthHeaders());
  }

  /**
   * Get invoices for multiple photographers in a single API call (optimized bulk endpoint)
   *
   * @param number[] photographerIds
   * @return Observable<any>
   * */
  getBulkInvoicesByPhotographers(photographerIds: number[]): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}/invoices-bulk`,
      { photographer_ids: photographerIds },
      this.headersService.getAuthHeaders()
    );
  }

  downloadInvoice(formData: FormData): Observable<Blob> {
    return this.http.post(`${environment.apiUrl}/download-invoice`, formData, {
      headers: this.headersService.getAuthHeaders().headers,
      responseType: 'blob'
    });
  }

}
