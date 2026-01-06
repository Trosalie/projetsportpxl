import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { HttpHeadersService } from './http-headers.service';

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

  getMailLogs(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/mail-logs`, this.headersService.getAuthHeaders());
  }
}