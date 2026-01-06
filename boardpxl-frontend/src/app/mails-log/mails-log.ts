import { Component, OnDestroy } from '@angular/core';
import { AuthService } from '../services/auth-service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MailService } from '../services/mail-service';

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
  protected expandedMailId: number | null = null;
  private destroy$ = new Subject<void>();

  constructor(private authService: AuthService, private mailService: MailService) {
    this.authService.logout$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.destroy$.next();
    });
  }

  ngOnInit() {
    this.isLoading = true;

    requestAnimationFrame(() => {
      const el = document.querySelector('.mails-list') as HTMLElement | null;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const y = rect.top + window.scrollY;
      el.style.height = `calc(100vh - ${y}px - 10px)`;
    });

    this.mailService.getMailLogs(this.authService.getUser()?.id || 0)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: mails => {
          this.mails = mails;
          this.filteredMails = this.mails;
          this.isLoading = false;
        },
        error: error => {
          console.error('Failed to load mail logs', error);
          this.isLoading = false;
        }
      });
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
      case 'versement':
        return 'Versement';
      case 'crédits':
        return 'Crédits';
      case 'generic':
        return 'Générique';
      default:
        return type;
    }
  }

  toggleMailBody(mailId: number): void {
    this.expandedMailId = this.expandedMailId === mailId ? null : mailId;
  }

  isExpanded(mailId: number): boolean {
    return this.expandedMailId === mailId;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
