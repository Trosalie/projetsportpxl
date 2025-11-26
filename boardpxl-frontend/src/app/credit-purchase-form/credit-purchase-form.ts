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
  clientFirstName: string = 'Thibault';
  clientLastName: string = 'Rosalie';
  findClient: boolean = false;
  clientsNames: string[] = [];
  filteredClients: string[] = [];
  photographerInput: string = '';
  notificationVisible: boolean = false;

  constructor(private invoiceService: InvoiceService, private clientService: ClientService) {}

  ngOnInit() {
    // Cherche le client par nom/prénom
    this.clientService.getClientId(this.clientFirstName, this.clientLastName).subscribe({
      next: (data) => {
        if (data && data.client_id) {
          this.clientId = data.client_id;
          this.findClient = true;
          this.photographerInput = '';
          console.log('Client ID:', this.clientId);
        } else {
          // Client non trouvé : récupérer la liste complète pour suggestions
          this.findClient = false;
          this.loadClients();
        }
      },
      error: (err) => {
        console.error('Erreur fetch client ID :', err);
        this.findClient = false;
        this.showNotification();
        this.loadClients();
      }
    });
  }

  // Récupère tous les clients pour suggestions
  loadClients() {
    this.clientService.getClients().subscribe({
      next: (res) => {
        this.clientsNames = res.clients.map((c: any) => c.name);
        console.log('Clients récupérés :', this.clientsNames);
      },
      error: (err) => console.error('Erreur fetch clients :', err)
    });
  }


  // Actualise les suggestions de photographes en fonction de la saisie
  onPhotographerChange(value: string) {
    this.photographerInput = value;

    // Vérifie si le photographe existe
    this.findClient = this.clientsNames.includes(value);

    // Filtrer les suggestions en fonction du texte saisi
    this.filteredClients = this.clientsNames.filter(name =>
      name.toLowerCase().includes(value.toLowerCase())
    );
  }

  // Sélectionne un photographe dans la liste des suggestions
  selectPhotographer(name: string) {
    this.photographerInput = name;
    this.findClient = true;
    this.filteredClients = [];
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
      invoiceTitle: `Achat de crédits`
    };
    this.invoiceService.createCreditsInvoice(body).subscribe({
      next: () => alert('Achat enregistré !'),
      error: () => alert('Erreur lors de l’enregistrement.'),
    });
    console.log(body);
  }

  // Afficher la notification quelques secondes
  showNotification() {
    this.notificationVisible = true;
    setTimeout(() => {
      this.notificationVisible = false;
    }, 5000); // 5 secondes
  }
}
