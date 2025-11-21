import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

interface LoginResponse {
  photographer: any;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, {
      email,
      password
    });
  }

  saveToken(token: string) {
    localStorage.setItem('api_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('api_token');
  }

  logout() {
    localStorage.removeItem('api_token');
  }
}
