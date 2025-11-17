import { Component, Input } from '@angular/core';
import { InvoicePayment } from '../models/invoice-payment.model';
import { InvoiceCredit } from '../models/invoice-credit.model';

@Component({
  selector: 'app-invoice-card',
  standalone: false,
  templateUrl: './invoice-card.html',
  styleUrl: './invoice-card.scss',
})
export class InvoiceCard {
  @Input() invoice!: InvoicePayment | InvoiceCredit;
  protected invoicePayment!: InvoicePayment;
  protected invoiceCredit!: InvoiceCredit;
  protected invoiceType!: string;

  ngOnInit(): void {
    if (!this.invoice) {
      // No invoice provided — don't build/initialize the component
      this.invoiceType = '';
      return;
    }

    if (this.invoice instanceof InvoicePayment) {
      this.invoicePayment = this.invoice;
      this.invoiceType = 'Payment';
    } else if (this.invoice instanceof InvoiceCredit) {
      this.invoiceCredit = this.invoice;
      this.invoiceType = 'Credit';
    } else {
      // Unknown invoice type — treat as empty
      this.invoiceType = '';
    }
  }

}
