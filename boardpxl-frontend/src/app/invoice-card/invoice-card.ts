import { Component, Input } from '@angular/core';
import { InvoicePayment } from '../models/invoice-payment.model';
import { InvoiceCredit } from '../models/invoice-credit.model';
import { HttpClient } from '@angular/common/http';

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

  constructor(private http: HttpClient) {}

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
    this.http.post('http://localhost:9000/api/download-invoice', formData, { responseType: 'blob' })
      .subscribe(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = pdf_invoice_subject;
        a.click();
        window.URL.revokeObjectURL(url);
      }, error => {
        alert('Impossible de télécharger le fichier.');
      });
  }

}
