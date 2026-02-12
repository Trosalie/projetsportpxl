import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpHeadersService } from './http-headers.service';
import { Mail } from '../models/mail.model';

@Injectable({
  providedIn: 'root',
})
export class MailService {

  constructor(private http: HttpClient, private headersService: HttpHeadersService) {
  }

  sendMail(to: string, from: string, subject: string, body: string, type: string): Observable<any> {
    const payload = {
      to: to,
      from: from,
      subject: subject,
      body: body,
      type: type
    };
    return this.http.post(`${environment.apiUrl}/send-email`, payload, this.headersService.getAuthHeaders());
  }

  getMailLogs(sender_id: number): Observable<Mail[]> {
    return this.http.get<Mail[]>(`${environment.apiUrl}/mail-logs/${sender_id}`, this.headersService.getAuthHeaders());
  }
}