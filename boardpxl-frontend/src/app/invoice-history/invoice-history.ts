import { Component, Input, OnDestroy } from '@angular/core';
import { InvoicePayment } from '../models/invoice-payment.model';
import { InvoiceCredit } from '../models/invoice-credit.model';
import { InvoiceService } from '../services/invoice-service';
import { FilterOptions } from '../invoice-filter/invoice-filter';
import { AuthService } from '../services/auth-service';
import { Subject } from 'rxjs';
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
  protected isLoading: boolean = true;
  @Input() user!: string;
  private destroy$ = new Subject<void>();

  constructor(private invoiceService: InvoiceService, private authService: AuthService) {
    this.authService.logout$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.destroy$.next();
    });
  }

  ngOnInit() {
    requestAnimationFrame(() => {
      const el = document.querySelector('.invoice-list') as HTMLElement | null;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const y = rect.top + window.scrollY;
      el.style.height = `calc(100vh - ${y}px - 10px)`;
    });

    this.invoiceService.getInvoicesByPhotographer(this.user)
      .pipe(takeUntil(this.destroy$))
      .subscribe(invoices => {
      this.invoices = invoices;
      for (let invoice of this.invoices) {
        let x = 0;
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

        this.invoiceService.getProductFromInvoice(invoice)
          .pipe(takeUntil(this.destroy$))
          .subscribe((product: any) => {
          // service may return a string, an object like { label: string } or an array where product[1] is the label
          let productValue= (product as any).label;

          if (productValue && productValue.toLowerCase().includes('crédits')) {
            let creditAmount = parseFloat(
              productValue
              .replace(/crédits/i, '')
              .replace(/\s+/g, '')
              .replace(',', '.')
              .replace(/[^\d.-]/g, '')
            );

            if (isNaN(creditAmount)) {
              // product may be an array; try common positions or an object-like .quantity, cast to any to avoid TS error
              creditAmount = parseFloat((product as any).quantity);
            }

            this.invoices.push(new InvoiceCredit(invoice.invoice_number, invoice.date, invoice.deadline, invoice.description, invoice.amount, invoice.tax, invoice.tax, invoice.remaining_amount_with_tax, creditAmount, invoice.status, invoice.public_file_url, invoice.pdf_invoice_subject));
          }
          else {
            this.invoices.push(new InvoicePayment(invoice.invoice_number, invoice.date, invoice.deadline, invoice.description, invoice.amount, invoice.amount, invoice.tax, invoice.tax, new Date(), new Date(), invoice.public_file_url, invoice.pdf_invoice_subject));
          }
        });
        this.invoices = this.invoices.filter(invoice => invoice instanceof InvoiceCredit || invoice instanceof InvoicePayment );
        this.filteredInvoices = this.invoices;
      }
      this.isLoading = false;
    });
  }

  onFilterChanged(filters: FilterOptions): void {

    this.filteredInvoices = this.invoices.filter(invoice => {
      const isCredit = invoice instanceof InvoiceCredit;
      const isPayment = invoice instanceof InvoicePayment;

      // Filter by status
      if (filters.statusFilters.length > 0) {
        if (filters.statusFilters.includes('Payée') && isPayment) {
          return true;
        }

        if (!filters.statusFilters.includes(invoice.status)) {
          return false;
        }
      }

      // Filter by type
      if (filters.typeFilters.length > 0) {
        if (filters.typeFilters.includes('Versement') && filters.typeFilters.includes('Achat de crédits')) {
          return true;
        }
        if (filters.typeFilters.includes('Achat de crédits') && !isCredit) {
          return false;
        }
        if (filters.typeFilters.includes('Versement') && !isPayment) {
          return false;
        }
        if (!filters.typeFilters.includes('Achat de crédits') && isCredit) {
          return false;
        }
        if (!filters.typeFilters.includes('Versement') && isPayment) {
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
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
