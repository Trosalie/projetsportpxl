import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment.development';
import { Photographer } from '../models/photographer.model';
import { HttpHeadersService } from './http-headers.service';

@Injectable({
  providedIn: 'root',
})
export class PhotographerService {
  private photographers: Photographer[] = [];
  private filteredPhotographers: Photographer[] = [];

  constructor(private http: HttpClient, private headersService: HttpHeadersService) {
  }

  // Retourne la liste des photographes, utilise le cache si disponible
  getPhotographers(): Observable<Photographer[]> {
    return this.http.get<Photographer[]>(`${environment.apiUrl}/photographers`, this.headersService.getAuthHeaders());
  }

  forceGetPhotographers(): Observable<Photographer[]> {
    console.log('Fetching photographers from API');
    return this.http.get<Photographer[]>(`${environment.apiUrl}/photographers`, this.headersService.getAuthHeaders()).pipe(
      tap(data => {
        this.photographers = data;
      })
    );
  }

  setFilteredPhotographers(filtered: Photographer[]) {
    this.filteredPhotographers = filtered;
  }

  getFilteredPhotographers(): Photographer[] {
    return this.filteredPhotographers;
  }

  getPhotographerIdByName(name: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/photographer-id?name=${encodeURIComponent(name)}`, this.headersService.getAuthHeaders());
  }
}
