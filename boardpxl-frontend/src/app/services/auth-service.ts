import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment.development';
import { Photographer } from '../models/photographer.model';

interface LoginResponse {
  user: Photographer;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = `${environment.apiUrl}`;
  private logoutSubject = new Subject<void>();
  public logout$ = this.logoutSubject.asObservable();

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

  // Save token and user data from login response
  saveToken(token: string, user: Photographer): void {
    localStorage.setItem('api_token', token);
    this.setUser(user);
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
    this.logoutSubject.next();
    this.http.post(`${this.apiUrl}/logout`, {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
        'Accept': 'application/json'
      }
    }).subscribe();
    localStorage.removeItem('api_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_role');
  }
}
