import { Component } from '@angular/core';
import { InvoiceService } from '../services/invoice-service';
import { ClientService } from '../services/client-service.service';
import { find } from 'rxjs';

@Component({
  selector: 'app-credit-purchase-form',
  standalone: false,
  templateUrl: './credit-purchase-form.html',
  styleUrl: './credit-purchase-form.scss',
})
export class CreditPurchaseForm {
  today: string = new Date().toISOString().slice(0, 10);
  clientId: any;
  findClient: boolean = false;
  clientNames: string[] = [];

  constructor(private invoiceService: InvoiceService, private clientService: ClientService) {}

  ngOnInit() {
    this.clientService.getClientId('Thibaultt', 'Rosalie').subscribe({
      next: (data) => {
        this.clientId = data.client_id;
        console.log('Client ID:', this.clientId);
        console.log('Data :', data);
        this.findClient = true;
      },
      error: (err) => {
        console.error('Error fetching client ID:', err);
      }
    });
    if (this.findClient != true) {
      this.clientService.getClients().subscribe({
      next: (res) => {
        this.clientNames = res.clients.map((c: any) => c.name);
        console.log(this.clientNames);
      }
    });
      console.log('Clients récupérés :', this.clientNames);
    }
    console.log(this.clientId);
  }

  onSubmit(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const issueDate = form['date'].value;
    const issue = new Date(issueDate);
    const due = new Date(issue);
    due.setMonth(due.getMonth() + 1);
    const dueDate = due.toISOString().slice(0, 10);
    const body = {
      labelTVA: (form['tva'] as HTMLSelectElement).value,
      labelProduct: `${form['credits'].value} crédits`,
      amountEuro: form['priceTTC'].value,
      issueDate: issueDate,
      dueDate: dueDate,
      idClient: 208474147,
      invoiceTitle: `Facture Decembre 2025 - Achat de crédits`
    };
    this.invoiceService.createCreditsInvoice(body).subscribe({
      next: () => alert('Achat enregistré !'),
      error: () => alert('Erreur lors de l’enregistrement.'),
    });
    console.log(body);
  }
}
