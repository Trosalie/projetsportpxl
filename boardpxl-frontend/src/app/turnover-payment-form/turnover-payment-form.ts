import { Component, ViewChild } from '@angular/core';
import { InvoiceService } from '../services/invoice-service';
import { ClientService } from '../services/client-service.service';
import { Popup } from '../popup/popup';

@Component({
  selector: 'app-turnover-payment-form',
  standalone: false,
  templateUrl: './turnover-payment-form.html',
  styleUrl: './turnover-payment-form.scss',
})
export class TurnoverPaymentForm {
    today: string = new Date().toISOString().slice(0, 10);
    clientId: any;
    clientName: string = 'Thibault Rosalie';
    findClient: boolean = false;
    creationFacture: boolean = false;
    clientsNames: string[] = [];
    filteredClients: string[] = [];
    photographerInput: string = '';
    notificationVisible: boolean = false;
    notificationMessage: string = "";
  
    constructor(private invoiceService: InvoiceService, private clientService: ClientService) {}
    @ViewChild('popup') popup!: Popup;
  
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
          } else {
            // Client non trouvé
            this.findClient = false;
            this.loadClients();
          }
        },
        error: (err) => {
          console.error('Erreur fetch client ID :', err);
          this.findClient = false;
          this.popup.showNotification("Le photographe n'a pas été trouvé !");
          this.loadClients();
        }
      });
    }
  
    // Récupère tous les clients pour suggestions
    loadClients() {
      this.clientService.getClients().subscribe({
        next: (res) => {
          this.clientsNames = res.clients.map((c: any) => c.name);
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
      const body = { name: this.clientName };
      this.clientService.getClientIdByName(body).subscribe({
        next: (data) => {
          if (data && data.client_id) {
            this.clientId = data.client_id;
          } else {
            this.popup.showNotification('Client non trouvé !');
          }      }, 
        error: (err) => {
          console.error('Erreur fetch client ID après sélection :', err);
        }
      });
    }
  
    onSubmit(event: Event) {
      event.preventDefault();
      const form = event.target as HTMLFormElement;
      const startDate = form['startDate'].value;
      const endDate = form['endDate'].value;
      const subject = form['Subject'].value;
      const commission = form['commission'].value;
      const chiffreAffaire = form['CA'].value
      const TVA = (form['tva'] as HTMLSelectElement).value;
      const issue = new Date(this.today);
      const due = new Date(issue);
      due.setMonth(due.getMonth() + 1);
      const dueDate = due.toISOString().slice(0, 10);
      if (!subject || !startDate || !endDate || !commission || !chiffreAffaire || !TVA || !this.findClient) {
        this.popup.showNotification("Merci de remplir tous les champs du formulaire.");
        console.log("Formulaire incomplet :", {subject, startDate, endDate, commission, chiffreAffaire, TVA, findClient: this.findClient});
        return;
      }
      const body = {
        labelTVA: TVA,
        amountEuro: commission,
        issueDate: this.today,
        dueDate: dueDate,
        idClient: this.clientId,
        invoiceTitle: subject,
        invoiceDescription: `Versement du chiffre d'affaire de ${chiffreAffaire}€ pour la période du ${startDate} au ${endDate}.`
      }
      this.creationFacture = true;
      this.invoiceService.createTurnoverPaymentInvoice(body).subscribe({
        next: () => {
          this.popup.showNotification('Facture créée avec succès !');
          this.creationFacture = false;
        },
        error: () => {
          this.popup.showNotification("Erreur lors de la création de la facture."),
          this.creationFacture = false;
        }
      });
  }
  
  
}
