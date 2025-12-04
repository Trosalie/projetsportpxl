import { Component, Input } from '@angular/core';
import { InvoiceService } from '../services/invoice-service';

@Component({
  selector: 'app-photographer-card',
  standalone: false,
  templateUrl: './photographer-card.html',
  styleUrl: './photographer-card.scss',
})
export class PhotographerCard {
  @Input() photographer!: any;
  @Input() index!: number;
  creditsInvoices: any[] = [];
  paymentInvoices: any[] = [];

  constructor(private invoiceService: InvoiceService) {}

  ngOnInit(): void {
    this.invoiceService.getInvoicesCreditByPhotographer(this.photographer.id).subscribe((invoices) => {
      this.creditsInvoices = invoices;
    });

    this.invoiceService.getInvoicesPaymentByPhotographer(this.photographer.id).subscribe((invoices) => {
      this.paymentInvoices = invoices;
    });
  }

  getChiffreAffaires(): number {
    let total = 0;
    for(let invoice of this.paymentInvoices) {
      total += invoice.turnover;
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
}
