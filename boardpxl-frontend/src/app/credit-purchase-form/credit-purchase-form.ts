import { Router, ActivatedRoute } from '@angular/router';
import { Component, ViewChild, OnDestroy } from '@angular/core';
import { InvoiceService } from '../services/invoice-service';
import { PhotographerService } from '../services/photographer-service';
import { Popup } from '../popup/popup';
import { AuthService } from '../services/auth-service';
import { ConfirmModal, type InvoiceData } from '../confirm-modal/confirm-modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


@Component({
  selector: 'app-credit-purchase-form',
  standalone: false,
  templateUrl: './credit-purchase-form.html',
  styleUrls: ['./credit-purchase-form.scss'],
})
export class CreditPurchaseForm implements OnDestroy {
  today: string = new Date().toISOString().slice(0, 10);
  clientId: any;
  pennylaneId: any;
  clientName: string = '';
  findClient: boolean = false;
  creationFacture: boolean = false;
  clientsNames: string[] = [];
  filteredClients: string[] = [];
  photographerInput: string = '';
  notificationVisible: boolean = false;
  notificationMessage: string = "";
  isLoading: boolean = false;
  showConfirmModal: boolean = false;
  modalData: InvoiceData | null = null;
  pendingFormData: any = null;
  private destroy$ = new Subject<void>();

  constructor(private invoiceService: InvoiceService, private photographerService: PhotographerService, private router: Router, private route: ActivatedRoute, private authService: AuthService) {
    this.authService.logout$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.destroy$.next();
    });
  }
  @ViewChild('popup') popup!: Popup;
  @ViewChild(ConfirmModal) confirmModal!: ConfirmModal;

  ngOnInit() {
    // Récupère le nom du client depuis les query params
    this.route.queryParams.subscribe(params => {
      this.clientName = params['clientName'] || '';
      
      // Cherche le client par nom/prénom
      if (this.clientName) {
        this.isLoading = true;
        this.photographerService.getPhotographerIdsByName(this.clientName).subscribe({
          next: (data) => {
            if (data && data.client_id) {
              this.clientId = data.client_id;
              this.pennylaneId = data.pennylane_id;
              this.findClient = true;
              this.photographerInput = this.clientName;
            } else {
              // Client non trouvé
              this.findClient = false;
              this.photographerInput = this.clientName;
            }
            this.isLoading = false;
            this.loadClients();
          },
          error: (err) => {
            console.error('Erreur fetch client ID :', err);
            this.isLoading = false;
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
    this.photographerService.getPhotographers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
      next: (res) => {
        this.clientsNames = res.map((c: any) => c.name);
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
    const normalizedQuery = value.trim().toLowerCase();
    this.filteredClients = this.clientsNames.filter(name => this.matchesQuery(name, normalizedQuery));
  }

  private matchesQuery(name: string, normalizedQuery: string): boolean {
    if (!normalizedQuery) return false;

    const normalizedName = name.toLowerCase();
    return normalizedName.startsWith(normalizedQuery) || normalizedName.includes(` ${normalizedQuery}`);
  }

  // Sélectionne un photographe dans la liste des suggestions
  selectPhotographer(name: string) {
    this.isLoading = true;
    this.photographerInput = name;
    this.findClient = true;
    this.filteredClients = [];
    this.clientName = name;
    this.photographerService.getPhotographerIdsByName(this.clientName)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
      next: (data) => {
        if (data && data.client_id) {
          this.clientId = data.client_id;
          this.pennylaneId = data.pennylane_id;
        } else {
          this.popup.showNotification('Client non trouvé !');
        }
        this.isLoading = false;
      }, 
      error: (err) => {
        console.error('Erreur fetch client ID après sélection :', err);
        this.isLoading = false;
      }
    });
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
    if (!subject || !dueDate || !form['priceHT'].value || !form['credits'].value || !(form['tva'] as HTMLSelectElement).value || !this.findClient) {
      this.popup.showNotification("Merci de remplir tous les champs du formulaire.");
      return;
    }

    // Store form data and show modal
    this.pendingFormData = {
      issueDate,
      subject,
      dueDate,
      priceHT: form['priceHT'].value,
      credits: form['credits'].value,
      tva: (form['tva'] as HTMLSelectElement).value
    };

    this.modalData = {
      title: subject,
      amount: parseFloat(form['priceHT'].value),
      items: [
        { label: 'Photographe', value: this.photographerInput },
        { label: 'Crédits', value: `${form['credits'].value} crédits` },
        { label: 'TVA', value: (form['tva'] as HTMLSelectElement).value }
      ]
    };

    this.showConfirmModal = true;
  }

  onConfirmInvoice() {
    if (!this.pendingFormData) return;

    const { issueDate, subject, dueDate, priceHT, credits, tva } = this.pendingFormData;
    const body = {
      labelTVA: tva,
      labelProduct: `${credits} crédits`,
      amountEuro: priceHT,
      issueDate: issueDate,
      dueDate: dueDate,
      idClient: this.pennylaneId,
      invoiceTitle: subject
    };
    this.creationFacture = true;
    this.showConfirmModal = false;
    this.invoiceService.createCreditsInvoice(body)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
      next: (response) => {
        this.popup.showNotification('Facture créée avec succès !');
        this.creationFacture = false;
        this.pendingFormData = null;
        this.modalData = null;
        this.insertCreditsInvoice( response, priceHT, credits, tva, "À venir", this.today, dueDate, this.clientId);
        setTimeout(() => {
          this.router.navigate(['/photographers']);
        }, 2000);
      },
      error: () => {
        this.popup.showNotification("Erreur lors de la création de la facture");
        this.creationFacture = false;
        this.showConfirmModal = true;
      }
    });
  }

  onCancelInvoice() {
    this.pendingFormData = null;
    this.modalData = null;
    this.showConfirmModal = false;
  }

  insertCreditsInvoice( reponse: any, amount: number, credits: number, tva: string, status: string, issueDate: string, dueDate: string, clientId: number) 
  {
    const invoice = reponse.data;
    const vatValue = this.convertTvaCodeToPercent(tva);

    const body = {
      id: invoice.id,
      number: invoice.invoice_number,
      issue_date: issueDate,
      due_date: dueDate,
      amount: amount,
      tax: invoice.tax,
      vat: vatValue,
      total_due: amount + invoice.tax, 
      credits: credits,
      status: status,
      link_pdf: invoice.public_file_url,
      photographer_id: clientId,
      pdf_invoice_subject: invoice.pdf_invoice_subject
    };

    this.invoiceService.insertCreditsInvoice(body)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
      next: () => {},
      error: err => console.error("Erreur insertion facture crédit :", err)
    });
  }



  private convertTvaCodeToPercent(tva: string): number {
    const value = tva.replace("FR_", "");

    const numeric = value.replace("_", ".");

    return parseFloat(numeric);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
