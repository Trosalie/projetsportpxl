import { Component, Input } from '@angular/core';
import { MailService } from '../services/mail-service';
import { AuthService } from '../services/auth-service';

@Component({
  selector: 'app-photographer-request',
  standalone: false,
  templateUrl: './photographer-request.html',
  styleUrl: './photographer-request.scss',
})
export class PhotographerRequest {
  @Input() requestType: 'versement' | 'crédits' = 'versement';
  protected requestMessage: string = '';
  protected isSending: boolean = false;

  constructor(private mailService: MailService, private authService: AuthService) {}

  ngOnInit() {
    requestAnimationFrame(() => {
      let el = document.querySelector('.container') as HTMLElement | null;
      if (!el) return;
      let rect = el.getBoundingClientRect();
      let y = rect.top + window.scrollY;
      el.style.height = `calc(100vh - ${y}px - 120px)`;

      if (this.requestType === 'versement') {
        this.requestMessage = `Bonjour,

Je vous contacte pour vous demander de bien vouloir procéder au versement de mon chiffre d'affaires, qui s'élève à [insérer le montant].
Merci d’avance pour le traitement de ma demande.

Cordialement,
[Prénom Nom]`;
      } else if (this.requestType === 'crédits') {
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
    // Validate form
    const ta = document.querySelector('textarea') as HTMLTextAreaElement | null;
    const errorMessage = document.querySelector('.error-message') as HTMLElement | null;

    const body = ta?.value || '';

    if (ta) {
      const clearError = () => {
      ta.style.border = '';
      if (errorMessage){
        errorMessage.style.opacity = '0';
        errorMessage.style.transform = '';
        errorMessage.innerHTML = '';
      }
      };

      ta.addEventListener('input', clearError);
    }

    if (!body.trim()) {
      if (ta) {
      ta.focus();
      ta.style.border = '1px solid #e74c3c';
      if (errorMessage) {
        errorMessage.innerHTML = 'Veuillez remplir le champ avant de soumettre la demande.';
        errorMessage.style.opacity = '1';

        // animation
        if (errorMessage.animate) {
        errorMessage.animate(
          [
          { transform: 'translateY(8px)', opacity: '1' },
          { transform: 'translateY(-8px)', opacity: '1' },
          { transform: 'translateY(4px)', opacity: '1' },
          { transform: 'translateY(0)', opacity: '1' }
          ],
          {
          duration: 420,
          easing: 'cubic-bezier(.2,.8,.2,1)',
          iterations: 1,
          fill: 'forwards'
          }
        );
        } else {
        errorMessage.style.transition = 'transform 0.14s cubic-bezier(.2,.8,.2,1)';
        errorMessage.style.transform = 'translateY(8px)';
        setTimeout(() => { errorMessage.style.transform = 'translateY(-8px)'; }, 140);
        setTimeout(() => { errorMessage.style.transform = 'translateY(4px)'; }, 280);
        setTimeout(() => { errorMessage.style.transform = 'translateY(0)'; }, 420);
        }
      }
      }
      return;
    } else {
      if (ta) {
      ta.style.border = '';
      }
    }

    let to = 'boardpxl@placeholder.com'; // remplacer par l'email de SportPXL
    let from = this.authService.getUser()?.email || ''; // remplacer par l'email du photographe connecté
    let subject = `[BoardPXL]`;
    if (this.requestType === 'versement') {
      subject += ' Demande de versement de chiffre d\'affaires';
    } else if (this.requestType === 'crédits') {
      subject += ' Demande d\'ajout de crédits';
    }

    this.isSending = true;
    this.mailService.sendMail(to, from, subject, body).subscribe({
      next: (response) => {
        this.isSending = false;
        window.location.assign('/request/success');
      },
      error: (error) => {
        this.isSending = false;
        window.location.assign('/request/failure');
      }
    });

  }
}