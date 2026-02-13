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
  selector: 'app-turnover-payment-form',
  standalone: false,
  templateUrl: './turnover-payment-form.html',
  styleUrl: './turnover-payment-form.scss',
})
export class TurnoverPaymentForm implements OnDestroy {
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
              this.popup.showNotification(this.translate.instant('TURNOVER_PAYMENT_FORM.NO_PHOTOGRAPHER'));
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
            this.popup.showNotification(this.translate.instant('TURNOVER_PAYMENT_FORM.NO_PHOTOGRAPHER'));
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
      const startDate = form['startDate'].value;
      const endDate = form['endDate'].value;
      const subject = form['Subject'].value;
      const chiffreAffaire = form['CA'].value
      const TVA = (form['tva'] as HTMLSelectElement).value;
      const issue = new Date(this.today);
      const due = new Date(issue);
      due.setMonth(due.getMonth() + 1);
      const dueDate = due.toISOString().slice(0, 10);
      if (!subject || !startDate || !endDate || !chiffreAffaire || !TVA || !this.findClient) {
        this.popup.showNotification(this.translate.instant('TURNOVER_PAYMENT_FORM.MISSING_INPUT'));
        return;
      }

      // Store form data and show modal
      this.pendingFormData = {
        startDate,
        endDate,
        subject,
        chiffreAffaire,
        TVA,
        dueDate
      };

      this.modalData = {
        title: subject,
        amount: 0,
        items: [
          {
            label: this.translate.instant('TURNOVER_PAYMENT_FORM.TURNOVER_PAYMENT_FORM'),
            value: this.photographerInput
          },
          {
            label: this.translate.instant('TURNOVER_PAYMENT_FORM.LABEL_ITEM_TURNOVER'),
            value: this.translate.instant('TURNOVER_PAYMENT_FORM.CURRENCY_EURO', {
              amount: chiffreAffaire
            })
          },
          {
            label: this.translate.instant('TURNOVER_PAYMENT_FORM.LABEL_ITEM_PERIOD'),
            value: this.translate.instant('TURNOVER_PAYMENT_FORM.PERIOD_RANGE', {
              start: startDate,
              end: endDate
            })
          },
          {
            label: this.translate.instant('TURNOVER_PAYMENT_FORM.LABEL_ITEM_VAT'),
            value: TVA
          }
        ]
      };

      this.showConfirmModal = true;
  }

  onConfirmInvoice() {
    if (!this.pendingFormData) return;

    const { startDate, endDate, subject, chiffreAffaire, TVA, dueDate } = this.pendingFormData;
    const body = {
      labelTVA: TVA,
      issueDate: this.today,
      dueDate: dueDate,
      idClient: this.pennylaneId,
      invoiceTitle: subject,
      invoiceDescription: this.translate.instant(
        'TURNOVER_PAYMENT_FORM.WITHDRAWAL_DESCRIPTION',
        {
          amount: chiffreAffaire,
          start: startDate,
          end: endDate
        }
      )
    }
    this.creationFacture = true;
    this.showConfirmModal = false;
    this.invoiceService.createTurnoverPaymentInvoice(body)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
      next: (response) => {
        this.popup.showNotification(this.translate.instant('TURNOVER_PAYMENT_FORM.INVOICE_CREATED'));
        this.creationFacture = false;
        this.pendingFormData = null;
        this.modalData = null;
        this.insertTurnoverInvoice(response, startDate, endDate, chiffreAffaire, TVA, this.today, dueDate, this.clientId);
        setTimeout(() => {
          this.router.navigate(['/photographers']);
        }, 2000);
      },
      error: () => {
        this.popup.showNotification(this.translate.instant('TURNOVER_PAYMENT_FORM.ERROR_CREATED')),
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


  insertTurnoverInvoice(reponse: any, startDate: string, endDate: string, chiffreAffaire: number, tva: string, issueDate: string, dueDate: string, clientId: number) {

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
      montant: 0,
      tax: invoice.tax,
      vat: vatValue,
      start_period: startDate,
      end_period: endDate,
      link_pdf: invoice.public_file_url,
      photographer_id: clientId,
      pdf_invoice_subject: invoice.pdf_invoice_subject
    };

    this.invoiceService.insertTurnoverInvoice(body)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
      next: () => {},
      error: err => console.error("Erreur lors de l'insertion :", err)
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
