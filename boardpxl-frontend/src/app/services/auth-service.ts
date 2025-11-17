import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Photographer } from '../models/photographer.model';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  constructor(private http: HttpClient) {
  }

  login(clientId: string): Observable<Photographer[]> {
    return this.http.get<Photographer[]>(`${environment.apiUrl}/login`);
  }

  logout(clientId: string): Observable<Photographer[]> {
    return this.http.get<Photographer[]>(`${environment.apiUrl}/logout`);
  }
}
