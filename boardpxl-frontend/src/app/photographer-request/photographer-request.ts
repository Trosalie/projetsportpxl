import { Component, Input, ViewChild } from '@angular/core';
import { MailService } from '../services/mail-service';
import { AuthService } from '../services/auth-service';
import { Popup } from '../popup/popup';

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
  protected amount: string = '';
  private userName: string = '';

  constructor(private mailService: MailService, private authService: AuthService) {}

  @ViewChild('popup') popup!: Popup;

  ngOnInit() {
    requestAnimationFrame(() => {
      let el = document.querySelector('.container') as HTMLElement | null;
      if (!el) return;
      let rect = el.getBoundingClientRect();
      let y = rect.top + window.scrollY;
      el.style.height = `calc(100vh - ${y}px - 120px)`;

      const user = this.authService.getUser();
      this.userName = user ? user.name : '[Prénom Nom]';

      this.updateMessage();
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

  updateMessage() {
    let amountText = '[insérer le montant]';
    if (this.amount && this.amount !== '') {
      const amountValue = Number(this.amount);
      if (this.requestType === 'crédits') {
        amountText = Math.floor(amountValue).toString();
      } else {
        amountText = amountValue.toString();
      }
    }

    if (this.requestType === 'versement') {
      this.requestMessage = `Bonjour,

Je vous contacte pour vous demander de bien vouloir procéder au versement de mon chiffre d'affaires, qui s'élève à ${amountText} €.
Merci d'avance pour le traitement de ma demande.

Cordialement,
${this.userName}`;
    } else if (this.requestType === 'crédits') {
      this.requestMessage = `Bonjour,

Je vous contacte afin de solliciter l'envoi d'un devis pour ${amountText} crédits.
Merci de bien vouloir me transmettre le devis détaillé ainsi que les conditions et les délais.

Cordialement,
${this.userName}`;
    }
  }

  onAmountChange() {
    this.updateMessage();
  }

  submitRequest() {
    // Validate form
    const ta = document.querySelector('textarea') as HTMLTextAreaElement | null;
    const errorMessage = document.querySelector('.error-message') as HTMLElement | null;

    const body = ta?.value || '';

    // Validation du montant
    const isValidAmount = this.requestType === 'crédits' 
      ? (!this.amount || this.amount === '' || Number(this.amount) <= 0 || !Number.isInteger(Number(this.amount)))
      : (!this.amount || this.amount === '' || Number(this.amount) <= 0);
    
    if (isValidAmount) {
      if (errorMessage) {
        const messageType = this.requestType === 'crédits' ? 'un nombre entier de crédits' : 'un montant du chiffre d\'affaires';
        errorMessage.innerHTML = `Veuillez indiquer ${messageType} avant de soumettre la demande.`;
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
      return;
    }

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
    let type = '';
    if (this.requestType === 'versement') {
      subject += ' Demande de versement de chiffre d\'affaires';
      type = 'versement';
    } else if (this.requestType === 'crédits') {
      subject += ' Demande d\'ajout de crédits';
      type = 'crédits';
    }

    this.isSending = true;
    this.mailService.sendMail(to, from, subject, body, type).subscribe({
      next: (response) => {
        this.isSending = false;
        this.popup.showNotification('Votre demande a bien été envoyée !');
        setTimeout(() => {
          window.location.assign('');
        }, 3000);
      },
      error: (error) => {
        this.popup.showNotification('Erreur lors de l\'envoi du mail. Veuillez réessayer plus tard.');
        console.error('Erreur lors de l\'envoi du mail:', error);
        console.error('Détails de l\'erreur:', error.error);
        this.isSending = false;
        // Attendre 3 secondes avant de rediriger pour que l'utilisateur voie le message
        setTimeout(() => {
          window.location.assign('');
        }, 3000);
      }
    });

  }
}