import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { AuthService } from './auth-service';

@Injectable({
  providedIn: 'root',
})
export class MailService {

  constructor(private http: HttpClient, private authService: AuthService) {
  }

  sendMail(to: string, from: string, subject: string, body: string): Observable<any> {
    const payload = {
      to: to,
      from: from,
      subject: subject,
      body: body,
    };
    const token = this.authService.getToken();
    return this.http.post(`${environment.apiUrl}/send-email`, payload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
  }
}