import { Component, Input, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { InvoiceService } from '../services/invoice-service';
import { AuthService } from '../services/auth-service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-photographer-card',
  standalone: false,
  templateUrl: './photographer-card.html',
  styleUrl: './photographer-card.scss',
})
export class PhotographerCard implements OnDestroy, OnChanges {
  @Input() photographer!: any;
  @Input() index!: number;
  @Input() invoices?: any; // Données d'invoices passées en @Input
  
  creditsInvoices: any[] = [];
  paymentInvoices: any[] = [];
  isLoadingCredits: boolean = false;
  isLoadingPayments: boolean = false;
  isExpanded: boolean = false;
  
  // Propriétés calculées
  chiffreAffaires: number = 0;
  totalCredits: number = 0;
  lateInvoicesCount: number = 0;
  paidInvoicesCount: number = 0;
  unpaidInvoicesCount: number = 0;
  
  private destroy$ = new Subject<void>();

  constructor(private invoiceService: InvoiceService, private authService: AuthService) {
    this.authService.logout$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.destroy$.next();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Détecte quand les @Input changent
    if (changes['invoices'] && this.invoices) {
      console.log(`[${this.photographer.name}] INVOICES RECEIVED:`, this.invoices);
      this.processInvoices();
    }
  }

  ngOnInit(): void {
    // Calculer les crédits immédiatement
    this.totalCredits = this.photographer.total_limit - this.photographer.nb_imported_photos;
    
    // Si les invoices sont déjà passés en @Input, les utiliser directement
    if (this.invoices) {
      console.log(`[${this.photographer.name}] INVOICES ALREADY SET ON INIT`);
      this.processInvoices();
    }
  }

  private processInvoices(): void {
    console.log(`[${this.photographer.name}] PROCESSING INVOICES`);
    if (!this.invoices) {
      console.log(`[${this.photographer.name}] NO INVOICES DATA`);
      return;
    }
    
    this.creditsInvoices = this.invoices.credits || [];
    this.paymentInvoices = this.invoices.payments || [];
    
    console.log(`[${this.photographer.name}] Credits count:`, this.creditsInvoices.length);
    console.log(`[${this.photographer.name}] Payments count:`, this.paymentInvoices.length);
    
    this.calculateChiffreAffaires();
    this.calculateCreditStats();
    
    console.log(`[${this.photographer.name}] RESULTS - CA: ${this.chiffreAffaires}, Late: ${this.lateInvoicesCount}, Paid: ${this.paidInvoicesCount}, Unpaid: ${this.unpaidInvoicesCount}`);
  }

  private calculateChiffreAffaires(): void {
    this.chiffreAffaires = 0;
    for(let invoice of this.paymentInvoices) {
      const match = invoice.description.match(/(\d+(?:[.,]\d{2})?)\s*€/);
      const amount = match ? parseFloat(match[1].replace(',', '.')) : 0;
      this.chiffreAffaires += amount;
    }
  }

  private calculateCreditStats(): void {
    this.lateInvoicesCount = 0;
    this.paidInvoicesCount = 0;
    this.unpaidInvoicesCount = 0;

    // Statuts basés uniquement sur les factures de crédits
    for (const invoice of this.creditsInvoices) {
      const status = (invoice.status || '').toLowerCase();
      if (status === 'late') {
        this.lateInvoicesCount++;
      } else if (status === 'paid') {
        this.paidInvoicesCount++;
      } else if (status === 'upcoming' || status === 'unpaid') {
        this.unpaidInvoicesCount++;
      }
    }
    // Ne pas inclure les versements (payments) dans les statuts
  }

  getChiffreAffaires(): number {
    return this.chiffreAffaires;
  }

  getTotalCredits(): number {
    return this.totalCredits;
  }

  getLateInvoicesCount(): number {
    return this.lateInvoicesCount;
  }

  getPaidInvoicesCount(): number {
    return this.paidInvoicesCount;
  }

  getUnpaidInvoicesCount(): number {
    return this.unpaidInvoicesCount;
  }

  toggleExpand(): void {
    this.isExpanded = !this.isExpanded;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
