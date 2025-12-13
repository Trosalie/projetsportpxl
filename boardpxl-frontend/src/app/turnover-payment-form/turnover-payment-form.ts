import { Component, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
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
    clientName: string = '';
    findClient: boolean = false;
    creationFacture: boolean = false;
    clientsNames: string[] = [];
    filteredClients: string[] = [];
    photographerInput: string = '';
    notificationVisible: boolean = false;
    notificationMessage: string = "";
  
    constructor(private invoiceService: InvoiceService, private clientService: ClientService, private router: Router, private route: ActivatedRoute) {}
    @ViewChild('popup') popup!: Popup;
  
    ngOnInit() {
      // Récupère le nom du client depuis les query params
      this.route.queryParams.subscribe(params => {
        this.clientName = params['clientName'] || '';
        
        // Cherche le client par nom/prénom
        if (this.clientName) {
          const body = { name: this.clientName };
          this.clientService.getClientIdByName(body).subscribe({
            next: (data) => {
              if (data && data.client_id) {
                this.clientId = data.client_id;
                this.findClient = true;
                this.photographerInput = this.clientName;
              } else {
                // Client non trouvé
                this.findClient = false;
                this.photographerInput = this.clientName;
              }
              this.loadClients();
            },
            error: (err) => {
              console.error('Erreur fetch client ID :', err);
              this.findClient = false;
              this.popup.showNotification("Le photographe n'a pas été trouvé !");
              this.loadClients();
            }
          });
        } else {
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
        next: (response) => {
          this.popup.showNotification('Facture créée avec succès !');
          this.creationFacture = false;
          this.insertTurnoverInvoice(response, startDate, endDate, chiffreAffaire, commission, TVA, this.today, dueDate, this.clientId);
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 2000);
        },
        error: () => {
          this.popup.showNotification("Erreur lors de la création de la facture."),
          this.creationFacture = false;
        }
      });
  }
  

  insertTurnoverInvoice(reponse: any, startDate: string, endDate: string, chiffreAffaire: number, commission: number, tva: string, issueDate: string, dueDate: string, clientId: number) {

    const invoice = reponse.data;
    const vatValue = this.convertTvaCodeToPercent(tva);

    const body = {
      id: invoice.id,
      number: invoice.invoice_number,
      issue_date: invoice.date,
      due_date: invoice.deadline,
      description: invoice.pdf_description,
      turnover: chiffreAffaire,
      raw_value: invoice.currency_amount_before_tax, // montant HT
      commission: commission,
      tax: invoice.tax,
      vat: vatValue,
      start_period: startDate,
      end_period: endDate,
      link_pdf: invoice.public_file_url,
      photographer_id: clientId,
      pdf_invoice_subject: invoice.pdf_invoice_subject
    };

    console.log("Insertion de la facture avec le corps :", body);

    this.invoiceService.insertTurnoverInvoice(body).subscribe({
      next: () => {
        console.log("Insertion de la facture réussie.");
      },
      error: (err) => {
        console.error("Erreur lors de l'insertion :", err);
      }
    });
  
  }
  

  private convertTvaCodeToPercent(tva: string): number {
    const value = tva.replace("FR_", "");

    const numeric = value.replace("_", ".");

    return parseFloat(numeric);
  }
}
