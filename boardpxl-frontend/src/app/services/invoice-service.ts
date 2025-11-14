import { Injectable } from '@angular/core';
import { InvoicePayment } from '../models/invoice-payment.model';
import { InvoiceCredit } from '../models/invoice-credit.model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Invoice } from '../models/invoice.model';

@Injectable({
  providedIn: 'root',
})
export class InvoiceService {
  private invoices: InvoicePayment[] = [];

  constructor(private http: HttpClient) {
  }

  getInvoicesByClient(clientId: string): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`http://localhost:9000/api/invoices-client/${clientId}`);
  }

  getProductFromInvoice(invoice: Invoice): Observable<string> {
    return this.http.get<string>(`http://localhost:9000/api/invoice-product/${invoice.invoice_number}`);
  }
}
