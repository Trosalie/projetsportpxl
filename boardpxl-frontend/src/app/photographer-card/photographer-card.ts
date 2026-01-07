import { Component, Input, OnDestroy } from '@angular/core';
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
export class PhotographerCard implements OnDestroy {
  @Input() photographer!: any;
  @Input() index!: number;
  creditsInvoices: any[] = [];
  paymentInvoices: any[] = [];
  isLoadingCredits: boolean = true;
  isLoadingPayments: boolean = true;
  isExpanded: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(private invoiceService: InvoiceService, private authService: AuthService) {
    this.authService.logout$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.destroy$.next();
    });
  }

  ngOnInit(): void {
    this.invoiceService.getInvoicesCreditByPhotographer(this.photographer.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((invoices) => {
        this.creditsInvoices = invoices;
        this.isLoadingCredits = false;
      });

    this.invoiceService.getInvoicesPaymentByPhotographer(this.photographer.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((invoices) => {
        this.paymentInvoices = invoices;
        this.isLoadingPayments = false;
      });
  }

  getChiffreAffaires(): number {
    let total = 0;
    for(let invoice of this.paymentInvoices) {
      const match = invoice.description.match(/(\d+(?:[.,]\d{2})?)\s*€/);
      const amount = match ? parseFloat(match[1].replace(',', '.')) : 0;
      total += amount;
    }
    return total;
  }

  getTotalCredits(): number {
    return this.photographer.total_limit - this.photographer.nb_imported_photos;
  }

  getLateInvoicesCount(): number {
    let lateCount = 0;
    for(let invoice of this.creditsInvoices) {
      if(invoice.status === 'late') {
        lateCount++;
      }
    }
    return lateCount;
  }

  getPaidInvoicesCount(): number {
    let paidCount = 0;
    for(let invoice of this.creditsInvoices) {
      if(invoice.status === 'paid') {
        paidCount++;
      }
    }
    return paidCount;
  }

  getUnpaidInvoicesCount(): number {
    let unpaidCount = 0;
    for(let invoice of this.creditsInvoices) {
      if(invoice.status === 'upcoming') {
        unpaidCount++;
      }
    }
    return unpaidCount;
  }

  toggleExpand(): void {
    this.isExpanded = !this.isExpanded;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
