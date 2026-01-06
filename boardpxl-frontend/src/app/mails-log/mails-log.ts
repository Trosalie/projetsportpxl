import { Component, OnDestroy } from '@angular/core';
import { AuthService } from '../services/auth-service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-mails-log',
  standalone: false,
  templateUrl: './mails-log.html',
  styleUrl: './mails-log.scss',
})
export class MailsLog implements OnDestroy {
  protected mails: any[] = [];
  protected filteredMails: any[] = [];
  protected isLoading: boolean = true;
  protected searchQuery: string = '';
  private destroy$ = new Subject<void>();

  constructor(private authService: AuthService) {
    this.authService.logout$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.destroy$.next();
    });
  }

  ngOnInit() {
    requestAnimationFrame(() => {
      const el = document.querySelector('.mails-list') as HTMLElement | null;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const y = rect.top + window.scrollY;
      el.style.height = `calc(100vh - ${y}px - 10px)`;
    });

    // Mock data - À remplacer par un vrai service
    this.mails = [
      {
        id: 1,
        recipient: 'john.doe@example.com',
        subject: 'Facture #2024-001',
        status: 'sent',
        sentDate: new Date('2024-01-15'),
        type: 'invoice',
      },
      {
        id: 2,
        recipient: 'jane.smith@example.com',
        subject: 'Rappel de paiement',
        status: 'sent',
        sentDate: new Date('2024-01-14'),
        type: 'reminder',
      },
      {
        id: 3,
        recipient: 'bob.wilson@example.com',
        subject: 'Confirmation de commande',
        status: 'failed',
        sentDate: new Date('2024-01-13'),
        type: 'confirmation',
      },
      {
        id: 4,
        recipient: 'alice.johnson@example.com',
        subject: 'Devis #2024-045',
        status: 'sent',
        sentDate: new Date('2024-01-12'),
        type: 'quote',
      },
    ];

    this.filteredMails = this.mails;
    this.isLoading = false;
  }

  onSearch(query: string) {
    this.searchQuery = query;
    if (query.trim() === '') {
      this.filteredMails = this.mails;
    } else {
      this.filteredMails = this.mails.filter(mail =>
        mail.recipient.toLowerCase().includes(query.toLowerCase()) ||
        mail.subject.toLowerCase().includes(query.toLowerCase())
      );
    }
  }

  getStatusLabel(status: string): string {
    switch (status.toLowerCase()) {
      case 'sent':
        return 'Envoyé';
      case 'failed':
        return 'Échec';
      case 'pending':
        return 'En attente';
      default:
        return status;
    }
  }

  getTypeLabel(type: string): string {
    switch (type.toLowerCase()) {
      case 'invoice':
        return 'Facture';
      case 'reminder':
        return 'Rappel';
      case 'confirmation':
        return 'Confirmation';
      case 'quote':
        return 'Devis';
      default:
        return type;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
