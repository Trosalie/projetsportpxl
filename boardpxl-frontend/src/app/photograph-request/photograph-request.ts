import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-photograph-request',
  standalone: false,
  templateUrl: './photograph-request.html',
  styleUrl: './photograph-request.scss',
})
export class PhotographRequest {
  protected requestType: string = '';

  ngOnInit() {
    const url = window.location.href;
    if (url.includes('/request/payout')) {
      this.requestType = 'versement';
    } else if (url.includes('/request/credits')) {
      this.requestType = 'crédits';
    }
  }
}
