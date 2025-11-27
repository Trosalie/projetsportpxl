import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  constructor(private http: HttpClient) {}

  getClientIdByName(body: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/client-id` , body);
  }

  getClients(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/list-clients`);
  }
}
