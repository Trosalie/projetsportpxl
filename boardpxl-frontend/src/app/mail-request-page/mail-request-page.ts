import { Component } from '@angular/core';

@Component({
  selector: 'app-mail-request-page',
  standalone: false,
  templateUrl: './mail-request-page.html',
  styleUrl: './mail-request-page.scss',
})

export class MailRequestPage {
  protected requestType: 'versement' | 'crédits' = 'versement';

  ngOnInit() {
      requestAnimationFrame(() => {
        let el = document.querySelector('.container') as HTMLElement | null;
        if (!el) return;
        let rect = el.getBoundingClientRect();
        let y = rect.top + window.scrollY;
        el.style.height = `calc(100vh - ${y}px - 120px)`;
    });

  const url = window.location.href;
  if (url.includes('/request/payout')) {
      this.requestType = 'versement';
    } else if (url.includes('/request/credits')) {
      this.requestType = 'crédits';
    }
  }
}
