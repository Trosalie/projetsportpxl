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
}
