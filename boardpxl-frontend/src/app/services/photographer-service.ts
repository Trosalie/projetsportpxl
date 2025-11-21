import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { Photographer } from '../models/photographer.model';

@Injectable({
  providedIn: 'root',
})
export class PhotographService {
  constructor(private http: HttpClient) {
  }

  getPhotographs(): Observable<Photographer> {
    return this.http.get<Photographer>(`${environment.apiUrl}/photographs`);
  }
  
}
