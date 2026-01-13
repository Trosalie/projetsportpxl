import { Component, Input } from '@angular/core';
import { InvoicePayment } from '../models/invoice-payment.model';
import { InvoiceCredit } from '../models/invoice-credit.model';
import { InvoiceService } from '../services/invoice-service';

@Component({
  selector: 'app-invoice-card',
  standalone: false,
  templateUrl: './invoice-card.html',
  styleUrls: ['./invoice-card.scss'],
})
export class InvoiceCard {
  @Input() invoice!: InvoicePayment | InvoiceCredit;
  protected invoicePayment!: InvoicePayment;
  protected invoiceCredit!: InvoiceCredit;
  protected invoiceType!: string;

  constructor(private invoiceService: InvoiceService) {}

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

  openInvoice(link_pdf: string) {
    window.open(link_pdf);
  }

  downloadInvoice(fileUrl: string, pdf_invoice_subject: string) {
    const formData = new FormData();
    formData.append('file_url', fileUrl);
    //appel à l'API pour télécharger le fichier
    this.invoiceService.downloadInvoice(formData).subscribe((response: any) => {
      const blob = new Blob([response], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = pdf_invoice_subject;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    });
  }

  getTurnover(): number {
    return this.invoicePayment ? this.invoicePayment.raw_value : 0;
  }

}
