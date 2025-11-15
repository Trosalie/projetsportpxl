import { Injectable } from '@angular/core';
import { InvoicePayment } from '../models/invoice-payment.model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class MailService {

  constructor(private http: HttpClient) {
  }

  sendMail(to: string, from: string, subject: string, body: string): Observable<any> {
    const payload = {
      to: to,
      from: from,
      subject: subject,
      body: body,
    };
    return this.http.post(`${environment.apiUrl}/send-email`, payload);
  }
}