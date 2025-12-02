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
  invoices: any[] = [];

  constructor(private invoiceService: InvoiceService) {}

  ngOnInit(): void {
    //
  }

  getChiffreAffaires(): number {
    let total = 0;
    return total;
  }

  getTotalCredits(): number {
    let totalCredits = 0;
    return totalCredits;
  }

  getLateInvoicesCount(): number {
    let lateCount = 0;
    return lateCount;
  }

  getPaidInvoicesCount(): number {
    let paidCount = 0;
    return paidCount;
  }

  getUnpaidInvoicesCount(): number {
    let unpaidCount = 0;
    return unpaidCount;
  }
}
