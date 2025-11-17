import { Component } from '@angular/core';
import { InvoicePayment } from '../models/invoice-payment.model';
import { InvoiceCredit } from '../models/invoice-credit.model';

@Component({
  selector: 'app-invoice-history',
  standalone: false,
  templateUrl: './invoice-history.html',
  styleUrl: './invoice-history.scss',
})
export class InvoiceHistory {
  protected invoices: any[] = [];

  constructor() {
    // Sample data for demonstration purposes
    this.invoices = [new InvoicePayment('573709670175', new Date('2024-01-01'), new Date('2024-01-31'), 'Payment for January', 1000, 900, 100, 200, 50, new Date('2024-01-01'), new Date('2024-01-31'), 'https://app.pennylane.com/public/invoice/pdf?encrypted_id=OGn5%2BvHgRGJi8vFn9swjRkVqkv%2F01zUtoWwpPq9wlpd3mWTFAVAM%2BcNskdcfbz1xpceas1tY6F98Iw1KnP%2FMhxFHskubJbabYUi4mfNBBZJskGpgsa8oO0Wh--7zMhh7jU24U2mVug--IyLUwzDtiF9Dyisw9HLhdw%3D%3D', "facture1.pdf"),
                     new InvoicePayment('9Z-6465465432', new Date('2024-02-01'), new Date('2024-02-28'), 'Payment for February', 1200, 1100, 100, 240, 60, new Date('2024-02-01'), new Date('2024-02-28'), 'https://app.pennylane.com/public/invoice/pdf?encrypted_id=xyTY1AgKYlFAHtzu%2FdgvdncTnymcX1cYSAjbpiJ9lkQLa49GGhRVX7ZGw9jChRO2AF%2FTp%2BK8gzvzVxNOJ0JDZ1rMdds%2BTjKpMhRy8xbz5pzKBrjWY%2B2RCQcW--n7%2BO4ecj%2BBZfKf1%2B--wQqAoBul9QaFxiLRCt2aqA%3D%3D', "facture2.pdf"),
                     new InvoiceCredit('646213265445', new Date('2024-03-01'), new Date('2024-03-31'), 'Credit for March', 500, 100, 20, 420, 50, 'Non payée', 'https://app.pennylane.com/public/invoice/pdf?encrypted_id=xyTY1AgKYlFAHtzu%2FdgvdncTnymcX1cYSAjbpiJ9lkQLa49GGhRVX7ZGw9jChRO2AF%2FTp%2BK8gzvzVxNOJ0JDZ1rMdds%2BTjKpMhRy8xbz5pzKBrjWY%2B2RCQcW--n7%2BO4ecj%2BBZfKf1%2B--wQqAoBul9QaFxiLRCt2aqA%3D%3D', "facture3.pdf"),
                     new InvoiceCredit('573709670176', new Date('2024-04-01'), new Date('2024-04-30'), 'Credit for April', 600, 120, 24, 456, 60, 'En retard', 'https://app.pennylane.com/public/invoice/pdf?encrypted_id=xyTY1AgKYlFAHtzu%2FdgvdncTnymcX1cYSAjbpiJ9lkQLa49GGhRVX7ZGw9jChRO2AF%2FTp%2BK8gzvzVxNOJ0JDZ1rMdds%2BTjKpMhRy8xbz5pzKBrjWY%2B2RCQcW--n7%2BO4ecj%2BBZfKf1%2B--wQqAoBul9QaFxiLRCt2aqA%3D%3D', "facture4.pdf")
    ];
  }

  ngOnInit() {
    setTimeout(() => {
      const el = document.querySelector('.invoice-list') as HTMLElement | null;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const y = rect.top + window.scrollY;
      el.style.height = `calc(100vh - ${y}px - 10px)`;
    }, 0);
  }

}
