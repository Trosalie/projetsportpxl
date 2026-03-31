import { Component, Input, OnDestroy } from '@angular/core';
import { InvoicePayment } from '../models/invoice-payment.model';
import { InvoiceCredit } from '../models/invoice-credit.model';
import { InvoiceSubscription } from '../models/invoice-subscription.model';
import { InvoiceService } from '../services/invoice-service';
import { FilterOptions } from '../invoice-filter/invoice-filter';
import { AuthService } from '../services/auth-service';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-invoice-history',
  standalone: false,
  templateUrl: './invoice-history.html',
  styleUrl: './invoice-history.scss',
})

export class InvoiceHistory implements OnDestroy {
  protected invoices: any[] = [];
  protected filteredInvoices: any[] = [];
  protected bufferedList: any[] = [];
  protected renderedList: any[] = [];
  protected isLoading: boolean = true;
  protected itemsToShow: number = 10;
  protected filterActive: boolean = false;
  @Input() user!: string;
  private destroy$ = new Subject<void>();

  constructor(private invoiceService: InvoiceService, private authService: AuthService) {
    this.authService.logout$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.destroy$.next();
    });
  }


  ngOnInit() {
    forkJoin([
      this.invoiceService.getInvoicesCreditByPhotographer(Number(this.user)),
      this.invoiceService.getInvoicesPaymentByPhotographer(Number(this.user)),
      this.invoiceService.getInvoicesSubscriptionByPhotographer(Number(this.user))
    ])
    .pipe(takeUntil(this.destroy$))
    .subscribe(([creditInvoices, paymentInvoices, subscriptionInvoices]: [any[], any[], any[]]) => {
      const allInvoices: any[] = [];

      // Process credit invoices
      for (let invoice of creditInvoices) {
        switch (invoice.status.toLowerCase()) {
          case 'paid':
            invoice.status = 'Payée';
            break;
          case 'upcoming':
            invoice.status = 'Non payée';
            break;
          case 'late':
            invoice.status = 'En retard';
            break;
        }

        allInvoices.push(new InvoiceCredit(invoice.number, invoice.issue_date, invoice.due_date, invoice.amount, invoice.tax, invoice.vat, invoice.total_due, invoice.discount || 0, invoice.credits, invoice.status, invoice.link_pdf, invoice.pdf_invoice_subject));
      }

      // Process payment invoices
      for (let invoice of paymentInvoices) {
        allInvoices.push(new InvoicePayment(invoice.number, invoice.issue_date, invoice.due_date, invoice.description, invoice.raw_value, invoice.commission, invoice.tax, invoice.vat, invoice.start_period, invoice.end_period, invoice.link_pdf, invoice.pdf_invoice_subject));
      }

      for (let invoice of subscriptionInvoices) {
        switch (invoice.status.toLowerCase()) {
          case 'paid':
            invoice.status = 'Payée';
            break;
          case 'upcoming':
            invoice.status = 'Non payée';
            break;
          case 'late':
            invoice.status = 'En retard';
            break;
        }

        allInvoices.push(new InvoiceSubscription(invoice.number, invoice.issueDate, invoice.dueDate, invoice.description, invoice.raw_value, invoice.tax, invoice.vat, invoice.reduction, invoice.total_due, invoice.start_period, invoice.end_period, invoice.link_pdf, invoice.pdf_invoice_subject, invoice.status));
      }

      this.invoices = allInvoices;
      this.filteredInvoices = this.invoices;
      this.renderedList = this.filteredInvoices.slice(0, this.itemsToShow);
      this.filterActive = false;
      this.isLoading = false;
    });
  }

  onFilterChanged(filters: FilterOptions): void {

    this.filteredInvoices = this.invoices.filter(invoice => {
      const isCredit = invoice instanceof InvoiceCredit;
      const isPayment = invoice instanceof InvoicePayment;
      const isSubscription = invoice instanceof InvoiceSubscription;

      // Filter by type
      if (filters.typeFilters.length > 0) {
        const matchesType =
          (filters.typeFilters.includes('Achat de crédits') && isCredit) ||
          (filters.typeFilters.includes('Versement') && isPayment) ||
          (filters.typeFilters.includes('Abonnement') && isSubscription);

        if (!matchesType) {
          return false;
        }
      }

      // Filter by status
      if (filters.statusFilters.length > 0) {
        // For payments, status is always "Payée"
        const invoiceStatus = isPayment ? 'Payée' : invoice.status;

        if (!filters.statusFilters.includes(invoiceStatus)) {
          return false;
        }
      }

      // Filter by date range
      if (filters.periodFilters.startDate) {
        const startDate = new Date(filters.periodFilters.startDate);
        const invoiceDate = new Date(invoice.issueDate);
        if (invoiceDate < startDate) {
          return false;
        }
      }

      if (filters.periodFilters.endDate) {
        const endDate = new Date(filters.periodFilters.endDate);
        const invoiceDate = new Date(invoice.issueDate);
        if (invoiceDate > endDate) {
          return false;
        }
      }

      return true;
    });
    
    // Determine if filter is active
    const hasActiveFilters = filters.typeFilters.length > 0 || 
                            filters.statusFilters.length > 0 || 
                            (filters.periodFilters.startDate && filters.periodFilters.endDate);
    
    if (hasActiveFilters) {
      this.bufferedList = this.filteredInvoices;
      this.filterActive = true;
    } else {
      this.bufferedList = [];
      this.filterActive = false;
    }
    
    this.renderedList = this.filteredInvoices.slice(0, this.itemsToShow);
  }

  onPageChange(newList: any[]): void {
    this.renderedList = newList;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
