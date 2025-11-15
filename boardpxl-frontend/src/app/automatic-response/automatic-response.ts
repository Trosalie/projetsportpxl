import { Component } from '@angular/core';

@Component({
  selector: 'app-automatic-response',
  standalone: false,
  templateUrl: './automatic-response.html',
  styleUrl: './automatic-response.scss',
})
export class AutomaticResponse {
  protected requestType: 'versement' | 'crédits' = 'versement';
  protected requestStatus: 'success' | 'failure' = 'success';

  ngOnInit() {
    requestAnimationFrame(() => {
      let el = document.querySelector('.container') as HTMLElement | null;
      if (!el) return;
      let rect = el.getBoundingClientRect();
      let y = rect.top + window.scrollY;
      el.style.height = `calc(100vh - ${y}px - 120px)`;
  });

  const url = window.location.href;
  if (url.includes('/request/success')) {
      this.requestStatus = 'success';
    } else if (url.includes('/request/failure')) {
      this.requestStatus = 'failure';
    }
  }
}
