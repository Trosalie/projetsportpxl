import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class ClientService {
  private apiUrl = 'http://localhost:9000/api';
  constructor(private http: HttpClient) {}

  getClientId(prenom: string, nom: string): Observable<any> {
    const params = new HttpParams()
      .set('prenom', prenom)
      .set('nom', nom);

    return this.http.get(this.apiUrl + "/client-id" , { params });
  }

  getClients(): Observable<any> {
    return this.http.get(this.apiUrl + "/list-clients");
  }
}
