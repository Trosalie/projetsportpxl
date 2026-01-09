import { Router, ActivatedRoute } from '@angular/router';
import { Component, ViewChild, OnDestroy } from '@angular/core';
import { InvoiceService } from '../services/invoice-service';
import { PhotographerPennylaneService } from '../services/photographer-pennylane-service';
import { Popup } from '../popup/popup';
import { AuthService } from '../services/auth-service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


@Component({
  selector: 'app-credit-purchase-form',
  standalone: false,
  templateUrl: './credit-purchase-form.html',
  styleUrl: './credit-purchase-form.scss',
})
export class CreditPurchaseForm implements OnDestroy {
  today: string = new Date().toISOString().slice(0, 10);
  photographerId: any;
  photographerName: string = '';
  findPhotographer: boolean = false;
  creationFacture: boolean = false;
  photographersNames: string[] = [];
  filteredPhotographers: string[] = [];
  photographerInput: string = '';
  notificationVisible: boolean = false;
  notificationMessage: string = "";
  isLoading: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(private invoiceService: InvoiceService, private photographerPennylaneService: PhotographerPennylaneService, private router: Router, private route: ActivatedRoute, private authService: AuthService) {
    this.authService.logout$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.destroy$.next();
    });
  }
  @ViewChild('popup') popup!: Popup;

  ngOnInit() {
    // Récupère le nom du photographe depuis les query params
    this.route.queryParams.subscribe(params => {
      this.photographerName = params['photographerName'] || '';

      // Cherche le photographe par nom/prénom
      if (this.photographerName) {
        this.isLoading = true;
        const body = { name: this.photographerName };
        this.photographerPennylaneService.getPhotographerIdByName(body).subscribe({
          next: (data) => {
            if (data && data.photographerId) {
              this.photographerId = data.photographerId;
              this.findPhotographer = true;
              this.photographerInput = this.photographerName;
            } else {
              // Photographe non trouvé
              this.findPhotographer = false;
              this.photographerInput = this.photographerName;
            }
            this.isLoading = false;
            this.loadPhotographers();
          },
          error: (err) => {
            console.error('Erreur fetch photographer ID :', err);
            this.isLoading = false;
            this.findPhotographer = false;
            this.popup.showNotification("Le photographe n'a pas été trouvé !");
            this.loadPhotographers();
          }
        });
      } else {
        this.loadPhotographers();
      }
    });
  }

  // Récupère tous les photographes pour suggestions
  loadPhotographers() {
    this.photographerPennylaneService.getPhotographers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
      next: (res) => {
        this.photographersNames = res.photographers.map((c: any) => c.name);
      },
      error: (err) => console.error('Erreur fetch photographers :', err)
    });
  }


  // Actualise les suggestions de photographes en fonction de la saisie
  onPhotographerChange(value: string) {
    this.photographerInput = value;

    // Vérifie si le photographe existe
    this.findPhotographer = this.photographersNames.includes(value);

    // Filtrer les suggestions en fonction du texte saisi
    this.filteredPhotographers = this.photographersNames.filter(name =>
      name.toLowerCase().includes(value.toLowerCase())
    );
  }

  // Sélectionne un photographe dans la liste des suggestions
  selectPhotographer(name: string) {
    this.isLoading = true;
    this.photographerInput = name;
    this.findPhotographer = true;
    this.filteredPhotographers = [];
    this.photographerName = name;
    const body = { name: this.photographerName };
    this.photographerPennylaneService.getPhotographerIdByName(body)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
      next: (data) => {
        if (data && data.photographerId) {
          this.photographerId = data.photographerId;
        } else {
          this.popup.showNotification('Photographe non trouvé !');
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur fetch photographer ID après sélection :', err);
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
    if (!subject || !dueDate || !form['priceHT'].value || !form['credits'].value || !(form['tva'] as HTMLSelectElement).value || !this.findPhotographer) {
      this.popup.showNotification("Merci de remplir tous les champs du formulaire.");
      return;
    }
    const body = {
      labelTVA: (form['tva'] as HTMLSelectElement).value,
      labelProduct: `${form['credits'].value} crédits`,
      amountEuro: form['priceHT'].value,
      issueDate: issueDate,
      dueDate: dueDate,
      idPhotographer: this.photographerId,
      invoiceTitle: subject
    };
    this.creationFacture = true;
    this.invoiceService.createCreditsInvoice(body)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
      next: (response) => {
        this.popup.showNotification('Facture créée avec succès !');
        this.creationFacture = false;
        this.insertCreditsInvoice( response, form['priceHT'].value, form['credits'].value, (form['tva'] as HTMLSelectElement).value, "À venir",this.today, dueDate, this.photographerId);
        setTimeout(() => {
          this.router.navigate(['/photographers']);
        }, 2000);
      },
      error: () => {
        this.popup.showNotification("Erreur lors de la création de la facture");
        this.creationFacture = false;
      }
    });
  }

  insertCreditsInvoice(reponse: any, amount: number, credits: number, tva: string, status: string, issueDate: string, dueDate: string, photographerId: number)
  {
    const invoice = reponse.data;
    const vatValue = this.convertTvaCodeToPercent(tva);

    const body = {
      id: invoice.id,
      number: invoice.invoice_number,
      issue_date: issueDate,
      due_date: dueDate,
      description: invoice.pdf_description,
      amount: amount,
      tax: invoice.tax,
      vat: vatValue,
      total_due: amount + invoice.tax,
      credits: credits,
      status: status,
      link_pdf: invoice.public_file_url,
      photographer_id: photographerId,
      pdf_invoice_subject: invoice.pdf_invoice_subject
    };

    console.log("Insertion de la facture crédit avec :", body);

    this.invoiceService.insertCreditsInvoice(body)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
      next: () => console.log("Facture crédit enregistrée."),
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
