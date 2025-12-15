import { Injectable } from '@angular/core';
import { InvoicePayment } from '../models/invoice-payment.model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Invoice } from '../models/invoice.model';
import { environment } from '../../environments/environment.development';
import { AuthService } from './auth-service';

@Injectable({
  providedIn: 'root',
})
export class InvoiceService {

  constructor(private http: HttpClient, private authService: AuthService) {
  }

  getInvoicesByClient(clientId: string): Observable<Invoice[]> {
    const token = this.authService.getToken();
    return this.http.get<Invoice[]>(`${environment.apiUrl}/invoices-client/${clientId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
  }

  getProductFromInvoice(invoice: Invoice): Observable<string[]> {
    const token = this.authService.getToken();
    return this.http.get<string[]>(`${environment.apiUrl}/invoice-product/${invoice.invoice_number}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
  }

  getInvoicesPaymentByPhotographer(photographerId: number): Observable<InvoicePayment[]> {
    const token = this.authService.getToken();
    return this.http.get<InvoicePayment[]>(`${environment.apiUrl}/invoices-payment/${photographerId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
  }

  getInvoicesCreditByPhotographer(photographerId: number): Observable<InvoicePayment[]> {
    const token = this.authService.getToken();
    return this.http.get<InvoicePayment[]>(`${environment.apiUrl}/invoices-credit/${photographerId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
  }

  
  createCreditsInvoice(body: any): Observable<any> {
    const token = this.authService.getToken();
    return this.http.post(`${environment.apiUrl}/create-credits-invoice-client`, body, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
  }

  createTurnoverPaymentInvoice(body: any): Observable<any> {
    const token = this.authService.getToken();
    return this.http.post(`${environment.apiUrl}/create-turnover-invoice-client`, body, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
  }

  insertTurnoverInvoice(body: any): Observable<any> {
    const token = this.authService.getToken();
    return this.http.post(`${environment.apiUrl}/insert-turnover-invoice`, body, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
  }

  insertCreditsInvoice(body: any): Observable<any> {
    const token = this.authService.getToken();
    return this.http.post(`${environment.apiUrl}/insert-credits-invoice`, body, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
  }

  
}
