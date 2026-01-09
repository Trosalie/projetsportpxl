import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { HttpHeadersService } from './http-headers.service';

@Injectable({
  providedIn: 'root',
})
export class PhotographerPennylaneService {
  constructor(private http: HttpClient, private headersService: HttpHeadersService) {}

  getPhotographerIdByName(body: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/photographer-id` , body, this.headersService.getAuthHeaders());
  }

  getPhotographers(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/list-photographers`, this.headersService.getAuthHeaders());
  }
}
