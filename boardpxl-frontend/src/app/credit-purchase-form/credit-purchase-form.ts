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
  clientName: string = 'Thibaultt Rosalie';
  findClient: boolean = false;
  clientsNames: string[] = [];
  filteredClients: string[] = [];
  photographerInput: string = '';
  notificationVisible: boolean = false;
  notificationMessage: string = "";

  constructor(private invoiceService: InvoiceService, private clientService: ClientService) {}

  ngOnInit() {
    // Cherche le client par nom/prénom
    const body = { name: this.clientName };
    this.clientService.getClientIdByName(body).subscribe({
      next: (data) => {
        if (data && data.client_id) {
          this.clientId = data.client_id;
          this.findClient = true;
          this.photographerInput = this.clientName; 
          this.loadClients();
          console.log('Client ID:', this.clientId);
        } else {
          // Client non trouvé
          this.findClient = false;
          this.loadClients();
        }
      },
      error: (err) => {
        console.error('Erreur fetch client ID :', err);
        this.findClient = false;
        this.showNotification("Le photographe n'a pas été trouvé !");
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
    this.clientName = name;
    console.log('Client sélectionné :', this.clientName);
    const body = { name: this.clientName };
    this.clientId = this.clientService.getClientIdByName(body).subscribe({
      next: (data) => {
        if (data && data.client_id) {
          this.clientId = data.client_id;
          console.log('Client ID après sélection :', this.clientId);
        } else {
          console.error('Client non trouvé après sélection');
        }      }, 
      error: (err) => {
        console.error('Erreur fetch client ID après sélection :', err);
      }
    });
    
    console.log('Client ID après sélection :', this.clientId);
  }

  onSubmit(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const issueDate = form['date'].value;
    const subject = form['Subject'].value;
    const issue = new Date(issueDate);
    const due = new Date(issue);
    due.setMonth(due.getMonth() + 1);
    const dueDate = due.toISOString().slice(0, 10);
    const body = {
      labelTVA: (form['tva'] as HTMLSelectElement).value,
      labelProduct: `${form['credits'].value} crédits`,
      amountEuro: form['priceHT'].value,
      issueDate: issueDate,
      dueDate: dueDate,
      idClient: this.clientId,
      invoiceTitle: subject
    };
    this.invoiceService.createCreditsInvoice(body).subscribe({
      next: () => this.showNotification('Facture créée avec succès !'),
      error: () => this.showNotification("Erreur lors de la création de la facture."),
    });
    console.log(body);
  }

  // Afficher la notification quelques secondes
  showNotification(message: string) {
    console.log("Afficher notification:", message);
    this.notificationMessage = message;
    this.notificationVisible = true;
    setTimeout(() => {
      this.notificationVisible = false;
    }, 5000); // 5 secondes
  }
}
