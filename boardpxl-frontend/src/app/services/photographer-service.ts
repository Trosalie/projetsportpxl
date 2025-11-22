import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { Photographer } from '../models/photographer.model';

@Injectable({
  providedIn: 'root',
})
export class PhotographerService {
  constructor(private http: HttpClient) {
  }

  getPhotographers(): Observable<Photographer> {
    return this.http.get<Photographer>(`${environment.apiUrl}/photographers`);
  }
  
}
