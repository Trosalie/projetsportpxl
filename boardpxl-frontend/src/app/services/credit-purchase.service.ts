import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CreditPurchaseService {
  constructor(private http: HttpClient) {}

  purchaseCredits(body: any): Observable<any> {
    return this.http.post('/api/credit-purchase', body);
  }
}
