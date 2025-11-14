import { Component, Input } from '@angular/core';
import { InvoicePayment } from '../models/invoice-payment.model';
import { InvoiceCredit } from '../models/invoice-credit.model';
import { InvoiceService } from '../services/invoice-service';

@Component({
  selector: 'app-invoice-history',
  standalone: false,
  templateUrl: './invoice-history.html',
  styleUrl: './invoice-history.scss',
})
export class InvoiceHistory {
  protected invoices: any[] = [];
  @Input() user!: string;

  constructor(private invoiceService: InvoiceService) {
  }

  ngOnInit() {
    requestAnimationFrame(() => {
      const el = document.querySelector('.invoice-list') as HTMLElement | null;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const y = rect.top + window.scrollY;
      el.style.height = `calc(100vh - ${y}px - 10px)`;
    });

    this.invoiceService.getInvoicesByClient(this.user).subscribe(invoices => {
      this.invoices = invoices;
      for (let invoice of this.invoices) {
        switch (invoice.status.toLowerCase()) {
          case 'paid':
            invoice.status = 'Payée';
            break;
          case 'upcoming':
            invoice.status = 'Non payée';
            break;
          case 'overdue':
            invoice.status = 'En retard';
        }

        this.invoiceService.getProductFromInvoice(invoice).subscribe(product => {
          // service may return a string or an object like { product: string }
          const productValue = typeof product === 'string' ? product : (product as any)?.product;
          if (productValue.toLowerCase().includes('crédits')) {
            let creditAmount = parseFloat(
              productValue
              .replace(/crédits/i, '')
              .replace(/\s+/g, '')
              .replace(',', '.')
              .replace(/[^\d.-]/g, '')
            );
            console.log('Fetching credit for invoice:', invoice.invoice_number);
            console.log('Extracted credit amount:', creditAmount);

            this.invoices.push(new InvoiceCredit(invoice.invoice_number, invoice.date, invoice.deadline, invoice.description, invoice.amount, invoice.tax, invoice.tax, invoice.remaining_amount_with_tax, creditAmount, invoice.status, invoice.public_file_url));
          }
          else {
            this.invoices.push(new InvoicePayment(invoice.invoice_number, invoice.date, invoice.deadline, invoice.description, invoice.amount, invoice.amount, invoice.amount, invoice.tax, invoice.tax, new Date('now'), new Date('now'), invoice.public_file_url));
          }
        });
      }
    });
  }

}
