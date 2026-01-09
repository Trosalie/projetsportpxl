import { Injectable } from '@angular/core';
import { InvoicePayment } from '../models/invoice-payment.model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Invoice } from '../models/invoice.model';
import { environment } from '../../environments/environment.development';
import { HttpHeadersService } from './http-headers.service';

@Injectable({
  providedIn: 'root',
})
export class InvoiceService {

  constructor(private http: HttpClient, private headersService: HttpHeadersService) {
  }

  getInvoicesByPhotographer(photographerId: string): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${environment.apiUrl}/invoices-photographer/${photographerId}`, this.headersService.getAuthHeaders());
  }

  getProductFromInvoice(invoice: Invoice): Observable<string[]> {
    return this.http.get<string[]>(`${environment.apiUrl}/invoice-product/${invoice.invoice_number}`, this.headersService.getAuthHeaders());
  }

  getInvoicesPaymentByPhotographer(photographerId: number): Observable<InvoicePayment[]> {
    return this.http.get<InvoicePayment[]>(`${environment.apiUrl}/invoices-payment/${photographerId}`, this.headersService.getAuthHeaders());
  }

  getInvoicesCreditByPhotographer(photographerId: number): Observable<InvoicePayment[]> {
    return this.http.get<InvoicePayment[]>(`${environment.apiUrl}/invoices-credit/${photographerId}`, this.headersService.getAuthHeaders());
  }


  createCreditsInvoice(body: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/create-credits-invoice-photographer`, body, this.headersService.getAuthHeaders());
  }

  createTurnoverPaymentInvoice(body: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/create-turnover-invoice-photographer`, body, this.headersService.getAuthHeaders());
  }

  insertTurnoverInvoice(body: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/insert-turnover-invoice`, body, this.headersService.getAuthHeaders());
  }

  insertCreditsInvoice(body: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/insert-credits-invoice`, body, this.headersService.getAuthHeaders());
  }


}
