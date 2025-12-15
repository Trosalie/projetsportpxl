import { Injectable } from '@angular/core';
import { InvoicePayment } from '../models/invoice-payment.model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Invoice } from '../models/invoice.model';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class InvoiceService {

  constructor(private http: HttpClient) {
  }

  getInvoicesByClient(clientId: string): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${environment.apiUrl}/invoices-client/${clientId}`);
  }

  getProductFromInvoice(invoice: Invoice): Observable<string[]> {
    return this.http.get<string[]>(`${environment.apiUrl}/invoice-product/${invoice.invoice_number}`);
  }

  getInvoicesPaymentByPhotographer(photographerId: number): Observable<InvoicePayment[]> {
    return this.http.get<InvoicePayment[]>(`${environment.apiUrl}/invoices-payment/${photographerId}`);
  }

  getInvoicesCreditByPhotographer(photographerId: number): Observable<InvoicePayment[]> {
    return this.http.get<InvoicePayment[]>(`${environment.apiUrl}/invoices-credit/${photographerId}`);
  }

  
  createCreditsInvoice(body: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/create-credits-invoice-client`, body);
  }

  createTurnoverPaymentInvoice(body: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/create-turnover-invoice-client`, body);
  }

  insertTurnoverInvoice(body: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/insert-turnover-invoice`, body);
  }

  insertCreditsInvoice(body: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/insert-credits-invoice`, body);
  }

  
}
