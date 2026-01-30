import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PhotographerService } from '../services/photographer-service';
import { SettlementReportService } from '../services/settlement-report-service';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-settlement-report-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settlement-report-form.html',
  styleUrls: ['./settlement-report-form.scss']
})
export class SettlementReportFormComponent implements OnInit, OnDestroy {
  settlementForm!: FormGroup;
  clientsNames: string[] = [];
  filteredClients: string[] = [];
  photographerInput = '';
  isLoading = false;
  selectedPhotographerId: number | null = null;
  private photographersMap: Map<string, number> = new Map(); // Map nom -> ID
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder, 
    private photographerService: PhotographerService,
    private settlementReportService: SettlementReportService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadClients();
    this.setupAdvancePaymentsCalculation();
  }

  initForm(): void {
    const today = new Date().toISOString().split('T')[0];
    this.settlementForm = this.fb.group({
      photographer: ['', Validators.required],
      totalSalesAmount: ['', [Validators.required, Validators.min(0)]],
      commission: ['', [Validators.required, Validators.min(0)]],
      advancePayments: [{ value: '', disabled: true }, Validators.min(0)],
      periodStartDate: ['', Validators.required],
      periodEndDate: [today, Validators.required]
    });
  }

  /**
   * Configure le calcul automatique des acomptes versés
   * Formule : acomptes = totalSalesAmount - commission
   */
  setupAdvancePaymentsCalculation(): void {
    const totalSalesAmountControl = this.settlementForm.get('totalSalesAmount');
    const commissionControl = this.settlementForm.get('commission');
    const advancePaymentsControl = this.settlementForm.get('advancePayments');

    // Surveiller les changements des deux champs et recalculer les acomptes
    if (totalSalesAmountControl && commissionControl && advancePaymentsControl) {
      totalSalesAmountControl.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.calculateAdvancePayments();
        });

      commissionControl.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.calculateAdvancePayments();
        });
    }
  }

  /**
   * Calcule et met à jour le champ acomptes versés
   */
  private calculateAdvancePayments(): void {
    const totalSalesAmount = this.settlementForm.get('totalSalesAmount')?.value;
    const commission = this.settlementForm.get('commission')?.value;
    const advancePaymentsControl = this.settlementForm.get('advancePayments');

    if (totalSalesAmount && commission && advancePaymentsControl) {
      const advance = Number(totalSalesAmount) - Number(commission);
      // Utiliser patchValue sans emitEvent pour éviter une boucle infinie
      advancePaymentsControl.patchValue(advance, { emitEvent: false });
    }
  }
  loadClients(): void {
    this.isLoading = true;
    this.photographerService.getPhotographers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.clientsNames = res.map((c: any) => c.name);
          // Créer une map pour associer nom -> ID
          res.forEach((c: any) => {
            this.photographersMap.set(c.name, c.id);
          });
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }

  onPhotographerChange(value: string): void {
    this.photographerInput = value;
    // keep form control in sync
    this.settlementForm.get('photographer')?.setValue(value, { emitEvent: false });

    const normalizedQuery = value.trim().toLowerCase();
    this.filteredClients = this.clientsNames.filter(name => this.matchesQuery(name, normalizedQuery));
  }

  selectPhotographer(name: string): void {
    this.photographerInput = name;
    this.filteredClients = [];
    this.settlementForm.get('photographer')?.setValue(name);
    
    // Récupérer l'ID du photographe
    this.selectedPhotographerId = this.photographersMap.get(name) || null;
    
    // Charger le dernier relevé et calculer le CA
    if (this.selectedPhotographerId) {
      this.loadLastReportAndCalculateTurnover(this.selectedPhotographerId);
    }
  }

  private matchesQuery(name: string, normalizedQuery: string): boolean {
    if (!normalizedQuery) return false;
    const normalizedName = name.toLowerCase();
    return normalizedName.startsWith(normalizedQuery) || normalizedName.includes(` ${normalizedQuery}`);
  }

  /**
   * Charge le dernier relevé d'encaissement et calcule le CA depuis cette date
   * Prérempli le champ totalSalesAmount
   */
  private loadLastReportAndCalculateTurnover(photographerId: number): void {
    this.settlementReportService.getLastSettlementReport(photographerId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            // Il y a un relevé précédent
            const lastReport = response.data;
            const startDate = lastReport.period_end_date;
            
            // Mettre à jour la date de début avec la date de fin du dernier relevé
            this.settlementForm.patchValue({
              periodStartDate: startDate
            });

            // Calculer le CA depuis cette date
            this.calculateAndFillTurnover(photographerId, startDate);
          } else {
            // Pas de relevé précédent, calculer depuis le début (première facture)
            this.calculateAndFillTurnover(photographerId, '2020-01-01');
          }
        },
        error: (err) => {
          console.error('Erreur lors de la récupération du dernier relevé:', err);
          // En cas d'erreur, calculer depuis le début
          this.calculateAndFillTurnover(photographerId, '2020-01-01');
        }
      });
  }

  /**
   * Calcule le CA et prérempli le champ totalSalesAmount
   */
  private calculateAndFillTurnover(photographerId: number, startDate: string): void {
    this.settlementReportService.calculateTurnoverSinceDate(photographerId, startDate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            const turnover = response.data.turnover;
            // Préremplir le champ avec le CA calculé
            this.settlementForm.patchValue({
              totalSalesAmount: turnover
            });
          }
        },
        error: (err) => {
          console.error('Erreur lors du calcul du CA:', err);
        }
      });
  }

  onSubmit(): void {
    if (this.settlementForm.valid) {
      const formValue = this.settlementForm.value;
      this.generatePdf(formValue);
    } else {
      console.log('Form is invalid');
    }
  }

  resetForm(): void {
    this.settlementForm.reset();
  }

  private generatePdf(form: any): void {
    const doc = new jsPDF();
    const title = "Relevé d'encaissement – Mandat de gestion des ventes";
    const startDate = this.formatDate(form.periodStartDate);
    const endDate = this.formatDate(form.periodEndDate);
    const amount = this.formatCurrency(form.totalSalesAmount);
    const commission = this.formatCurrency(form.commission);
    const advances = this.formatCurrency(form.advancePayments);
    const today = this.formatDate(new Date().toISOString().split('T')[0]);
    const photographer = form.photographer || 'Photographe';

    // Title
    doc.setTextColor(0, 92, 141);
    doc.setFontSize(14);
    doc.text(title, 10, 20);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);

    // Platform address (left)
    doc.text('Plateforme :', 10, 32);
    doc.text('SPORTPXL', 10, 38);
    doc.text('100 Avenue de l\'Adour', 10, 44);
    doc.text('64600 ANGLET', 10, 50);

    // Photographer placeholder address (right)
    doc.text(photographer, 200, 32, { align: 'right' });
    doc.text('Adresse photographe', 200, 38, { align: 'right' });
    doc.text('Ville - Code postal', 200, 44, { align: 'right' });
    doc.text('Email photographe', 200, 50, { align: 'right' });

    let y = 70;
    doc.setFont('helvetica', 'bold');
    doc.text('Montants encaissés et reversements', 10, y);
    doc.setFont('helvetica', 'normal');
    y += 8;
    doc.text(`Période concernée : ${startDate} au ${endDate}`, 10, y); y += 6;
    doc.text(`Montant total des ventes TTC : ${amount}`, 10, y); y += 6;
    doc.text(`Commission SPORTPXL TTC : ${commission}`, 10, y); y += 6;
    doc.text(`Acomptes versés : ${advances}`, 10, y); y += 12;

    doc.setFont('helvetica', 'bold');
    doc.text('Rappel du cadre contractuel', 10, y); y += 8;
    doc.setFont('helvetica', 'normal');
    const contract = "Conformément aux Conditions Générales de la plateforme SPORTPXL acceptées lors de l'inscription, le photographe a confié à SPORTPXL un mandat pour commercialiser ses photographies, encaisser les sommes dues par les acheteurs et procéder aux reversements, déduction faite des commissions convenues.";
    y = this.wrapText(doc, contract, 10, y, 190, 6);
    y += 10;

    doc.setFont('helvetica', 'bold');
    doc.text('Responsabilités fiscales et sociales', 10, y); y += 8;
    doc.setFont('helvetica', 'normal');
    const resp = 'Le photographe reste seul responsable de ses déclarations fiscales et sociales liées aux revenus perçus via SPORTPXL. Ce relevé ne vaut pas déclaration et ne dispense en aucun cas des obligations légales déclaratives.';
    y = this.wrapText(doc, resp, 10, y, 190, 6);
    y += 12;

    doc.text(`Fait à Bayonne, le ${endDate || today}`, 10, y); y += 16;
    doc.text('Signature SPORTPXL', 10, y);
    doc.text('Signature du photographe', 200, y, { align: 'right' });

    const fileName = `releve-encaissement-${photographer.replace(/\s+/g, '_')}-${form.periodEndDate || today}.pdf`;
    doc.save(fileName);
  }

  private formatCurrency(value: number | string): string {
    const num = Number(value || 0);
    return `${num.toFixed(2).replace('.', ',')} €`;
  }

  private formatDate(value: string): string {
    if (!value) return '';
    const date = new Date(value);
    return date.toLocaleDateString('fr-FR');
  }

  private wrapText(doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number {
    const lines = doc.splitTextToSize(text, maxWidth);
    lines.forEach((line: string) => {
      doc.text(line, x, y);
      y += lineHeight;
    });
    return y;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
