import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { HttpHeadersService } from './http-headers.service';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  constructor(private http: HttpClient, private headersService: HttpHeadersService) {}

  getClients(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/list-clients`, this.headersService.getAuthHeaders());
  }

  getPhotographer(id: string|null): Observable<any> {
    return this.http.get(`${environment.apiUrl}/photographer/${id}`, this.headersService.getAuthHeaders());
  }
}
