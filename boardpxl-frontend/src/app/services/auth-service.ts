import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment.development';
import { Photographer } from '../models/photographer.model';

interface LoginResponse {
  user: any;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    const body = {
      email: email,
      password: password
    };
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, body);
  }

  getApiUser(): Observable<Photographer> {
    const token = this.getToken();
    return this.http.get<Photographer>(`${this.apiUrl}/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
  }

  // Return an Observable that completes after the user is fetched and cached
  saveToken(token: string): Observable<Photographer> {
    localStorage.setItem('api_token', token);
    return this.getApiUser().pipe(
      tap(fetched_user => {
        this.setUser(fetched_user);
      })
    );
  }

  getUser(): Photographer | null {
    const userData = localStorage.getItem('user');
    if (userData) {
      return JSON.parse(userData) as Photographer;
    }
    return null;
  }

  setUser(userData: Photographer){
    localStorage.setItem('user', JSON.stringify(userData));
  }

  getToken(): string | null {
    return localStorage.getItem('api_token');
  }

  logout() {
    localStorage.removeItem('api_token');
    localStorage.removeItem('user');
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe();
  }
}
