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
  protected redirection: boolean = false;
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
      this.userName = user ? user.name :  this.translate.instant('PHOTOGRAPHER_REQUEST.PLACEHOLDER_FULLNAME');

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
    let amountText = this.translate.instant('PHOTOGRAPHER_REQUEST.AMOUNT_PLACEHOLDER');
    if (this.amount && this.amount !== '') {
      const amountValue = Number(this.amount);
      if (this.requestType === 'crédits') {
        amountText = Math.floor(amountValue).toString();
      } else {
        amountText = amountValue.toString();
      }
    }

    if (this.requestType === 'versement') {
      this.requestMessage = this.translate.instant(
        'PHOTOGRAPHER_REQUEST.WITHDRAWAL_MESSAGE',
        {
          amount: amountText,
          name: this.userName
        }
      );
    } else if (this.requestType === 'crédits') {
      this.requestMessage = this.translate.instant(
        'PHOTOGRAPHER_REQUEST.CREDIT_MESSAGE',
        {
          amount: amountText,
          name: this.userName
        }
      );
    }
  }

  onAmountChange() {
    this.updateMessage();
  }

  submitRequest() {
    // Validate form
    const ta = document.querySelector('textarea') as HTMLTextAreaElement | null;
    const errorMessage = document.querySelector('.error-message') as HTMLElement | null;

    const body = this.requestMessage;

    // Validation du montant
    const isValidAmount = this.requestType === 'crédits'
      ? (!this.amount || this.amount === '' || Number(this.amount) <= 0 || !Number.isInteger(Number(this.amount)))
      : (!this.amount || this.amount === '' || Number(this.amount) <= 0);

    if (isValidAmount) {
      const messageType = this.requestType === 'crédits' ? this.translate.instant('PHOTOGRAPHER_REQUEST.TYPE_CREDITS')
        : this.translate.instant('PHOTOGRAPHER_REQUEST.TYPE_TURNOVER');
      this.popup.showNotification(
        this.translate.instant('PHOTOGRAPHER_REQUEST.MISSING_AMOUNT', {
          type: messageType
        })
      );
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
        errorMessage.innerHTML = this.translate.instant('PHOTOGRAPHER_REQUEST.ERROR_MISSING_INPUT');
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
      subject += this.translate.instant('PHOTOGRAPHER_REQUEST.TURNOVER_SUBJECT');
      type = this.translate.instant('PHOTOGRAPHER_REQUEST.TURNOVER_TYPE');
    } else if (this.requestType === 'crédits') {
      subject += this.translate.instant('PHOTOGRAPHER_REQUEST.CREDIT_SUBJECT');
      type = this.translate.instant('PHOTOGRAPHER_REQUEST.CREDIT_TYPE');
    }

    this.isSending = true;
    this.mailService.sendMail(to, from, subject, body, type).subscribe({
      next: (response) => {
        this.isSending = false;
        this.redirection = true;
        this.popup.showNotification(this.translate.instant('PHOTOGRAPHER_REQUEST.SUCCEEDED_REQUEST'));
        setTimeout(() => {
          window.location.assign('');
        }, 3000);
      },
      error: (error) => {
        this.popup.showNotification(this.translate.instant('PHOTOGRAPHER_REQUEST.ERROR_TRY_LATER'));
        console.error('Erreur lors de l\'envoi du mail:', error);
        console.error('Détails de l\'erreur:', error.error);
        this.isSending = false;
        this.redirection = true;
        // Attendre 3 secondes avant de rediriger pour que l'utilisateur voie le message
        setTimeout(() => {
          window.location.assign('');
        }, 3000);
      }
    });

  }
}
