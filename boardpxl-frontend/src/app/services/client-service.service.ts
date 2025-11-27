import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class ClientService {
  private apiUrl = 'http://localhost:9000/api';
  constructor(private http: HttpClient) {}

  getClientIdByName(body: any): Observable<any> {
    return this.http.post(this.apiUrl + "/client-id" , body);
  }

  getClients(): Observable<any> {
    return this.http.get(this.apiUrl + "/list-clients");
  }
}
