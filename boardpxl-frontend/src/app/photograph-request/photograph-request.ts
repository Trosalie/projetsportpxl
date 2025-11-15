import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-photograph-request',
  standalone: false,
  templateUrl: './photograph-request.html',
  styleUrl: './photograph-request.scss',
})
export class PhotographRequest {
  protected requestType: string = '';
  protected requestMessage: string = '';

  ngOnInit() {
    requestAnimationFrame(() => {
      let el = document.querySelector('.container') as HTMLElement | null;
      if (!el) return;
      let rect = el.getBoundingClientRect();
      let y = rect.top + window.scrollY;
      el.style.height = `calc(100vh - ${y}px - 120px)`;

      const url = window.location.href;
      if (url.includes('/request/payout')) {
        this.requestType = 'versement';
        this.requestMessage = `Bonjour,

Je vous contacte pour vous demander de bien vouloir procéder au versement de mon chiffre d'affaires, qui s'élève à [insérer le montant].
Merci d’avance pour le traitement de ma demande.

Cordialement,
[Prénom Nom]`;
      } else if (url.includes('/request/credits')) {
        this.requestType = 'crédits';
        this.requestMessage = `Bonjour,

Je vous contacte afin de solliciter l'envoi d'un devis pour [insérer le montant] crédits.
Merci de bien vouloir me transmettre le devis détaillé ainsi que les conditions et les délais.

Cordialement,
[Prénom Nom]`;
      }
    });

    const textareas = Array.from(document.querySelectorAll('textarea')) as HTMLTextAreaElement[];
      textareas.forEach((ta) => {
        let label: HTMLElement | null = null;
        if (ta.id) {
          label = document.querySelector(`label[for="${ta.id}"]`);
        }
        if (!label) {
          const prev = ta.previousElementSibling as HTMLElement | null;
          if (prev?.tagName.toLowerCase() === 'label') label = prev;
        }
        if (!label) return;

        label.style.transition = 'opacity 0.2s ease';
        label.style.opacity = '0.5';

        const onFocus = () => { if (label) label.style.opacity = '0'; };
        const onBlur = () => { if (label) label.style.opacity = '0.5'; };

        ta.addEventListener('focus', onFocus);
        ta.addEventListener('blur', onBlur);
      });

  }

  submitRequest() {
    alert(`Votre demande de ${this.requestType} a été soumise.`);
  }
}
