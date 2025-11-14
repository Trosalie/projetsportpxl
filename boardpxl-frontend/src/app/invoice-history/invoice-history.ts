import { Component } from '@angular/core';
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

  constructor(private invoiceService: InvoiceService) {
  }

  ngOnInit() {
    setTimeout(() => {
      const el = document.querySelector('.invoice-list') as HTMLElement | null;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const y = rect.top + window.scrollY;
      el.style.height = `calc(100vh - ${y}px - 10px)`;
    }, 0);

    this.invoiceService.getInvoicesByClient('208474147').subscribe(invoices => {
      this.invoices = invoices;
      for (let invoice of this.invoices) {
        console.log(invoice.invoice_lines.url);
      }
    });

  }

}
