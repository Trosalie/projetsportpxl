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

  constructor(private http: HttpClient) {
  }

  // Retourne la liste des photographes, utilise le cache si disponible
  getPhotographers(): Observable<Photographer[]> {
    if (this.photographers.length > 0) {
      console.log('Returning photographers from cache');
      return of(this.photographers);
    } else {
      console.log('Fetching photographers from API');
      return this.http.get<Photographer[]>(`${environment.apiUrl}/photographers`)
        .pipe(
          tap(data => this.photographers = data)
        );
    }
  }

  forceGetPhotographers(): Observable<Photographer[]> {
    return this.http.get<Photographer[]>(`${environment.apiUrl}/photographers`)
    .pipe(
      tap(data => this.photographers = data)
    );
  }
}
