import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment.development';
import { Photographer } from '../models/photographer.model';

@Injectable({
  providedIn: 'root',
})
export class PhotographerService {
  private photographers: Photographer[] = [];
  private filteredPhotographers: Photographer[] = [];

  constructor(private http: HttpClient) {
  }

  // Retourne la liste des photographes, utilise le cache si disponible
  getPhotographers(): Observable<Photographer[]> {
    return this.http.get<Photographer[]>(`${environment.apiUrl}/photographers`);
  }

  forceGetPhotographers(): Observable<Photographer[]> {
      console.log('Fetching photographers from API');
      this.http.get<Photographer[]>(`${environment.apiUrl}/photographers`).subscribe(data => {
        this.photographers = data;
      });

      return of(this.photographers);
  }

  setFilteredPhotographers(filtered: Photographer[]) {
    this.filteredPhotographers = filtered;
  }

  getFilteredPhotographers(): Photographer[] {
    return this.filteredPhotographers;
  }
}
