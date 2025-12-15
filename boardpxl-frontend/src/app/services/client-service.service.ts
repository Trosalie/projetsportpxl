import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { AuthService } from './auth-service';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  constructor(private http: HttpClient, private authService: AuthService) {}

  getClientIdByName(body: any): Observable<any> {
    const token = this.authService.getToken();
    return this.http.post(`${environment.apiUrl}/client-id` , body, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
  }

  getClients(): Observable<any> {
    const token = this.authService.getToken();
    return this.http.get(`${environment.apiUrl}/list-clients`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
  }
}
