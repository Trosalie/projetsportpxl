import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SettlementReportService } from '../services/settlement-report-service';
import { PhotographerService } from '../services/photographer-service';
import { Router } from '@angular/router';
import jsPDF from 'jspdf';

/**
 * @component SettlementReportListComponent
 * @brief Component for displaying the list of settlement reports
 * 
 * @author SportPxl Team
 * @version 1.0.0
 * @date 2026-02-04
 */
@Component({
  selector: 'app-settlement-report-list',
  standalone: false,
  templateUrl: './settlement-report-list.html',
  styleUrls: ['./settlement-report-list.scss']
})
export class SettlementReportListComponent implements OnInit, OnDestroy {
  protected settlementReports: any[] = [];
  protected renderedList: any[] = [];
  protected itemsToShow: number = 10;
  protected bufferedList: any[] = [];
  protected filterActive: boolean = false;
  photographersMap: Map<number, string> = new Map();
  photographersDetailsMap: Map<number, any> = new Map();
  isLoading = false;
  errorMessage = '';
  private destroy$ = new Subject<void>();

  constructor(
    private settlementReportService: SettlementReportService,
    private photographerService: PhotographerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPhotographers();
    this.loadSettlementReports();
  }

  /**
   * Load all photographers to map IDs to names and store full details
   */
  private loadPhotographers(): void {
    this.photographerService.getPhotographers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (photographers) => {
          photographers.forEach((p: any) => {
            this.photographersMap.set(p.id, p.name);
            this.photographersDetailsMap.set(p.id, p);
          });
        },
        error: (err) => {
          console.error('Erreur lors du chargement des photographes:', err);
        }
      });
  }

  /**
   * Load all settlement reports
   */
  private loadSettlementReports(): void {
    this.isLoading = true;
    this.settlementReportService.getAllSettlementReports()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.settlementReports = response.data;
            this.renderedList = this.settlementReports.slice(0, this.itemsToShow);
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Erreur lors du chargement des relevés:', err);
          this.errorMessage = 'Erreur lors du chargement des relevés d\'encaissement';
          this.isLoading = false;
        }
      });
  }

  /**
   * Get photographer name by ID
   */
  getPhotographerName(photographerId: number): string {
    return this.photographersMap.get(photographerId) || 'Photographe inconnu';
  }

  /**
   * Format date for display
   */
  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR');
  }

  /**
   * Format currency for display
   */
  formatCurrency(value: number): string {
    if (value === null || value === undefined) return '0,00 €';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '0,00 €';
    return `${numValue.toFixed(2).replace('.', ',')} €`;
  }



  /**
   * Navigate to create new settlement report
   */
  createNewReport(): void {
    this.router.navigate(['/settlement-report']);
  }

  /**
   * Filter settlement reports based on search query
   */
  onFilterChange(query: string): void {
    const normalizedQuery = query.trim().toLowerCase();

    if (normalizedQuery === '') {
      this.renderedList = this.settlementReports.slice(0, this.itemsToShow);
      this.filterActive = false;
    } else {
      this.bufferedList = this.settlementReports.filter(report => {
        const photographerName = this.getPhotographerName(report.photographer_id).toLowerCase();
        return photographerName.includes(normalizedQuery);
      });
      this.renderedList = this.bufferedList.slice(0, this.itemsToShow);
      this.filterActive = true;
    }
  }

  /**
   * Handle page change event
   */
  onPageChange(newList: any[]): void {
    this.renderedList = newList;
  }

  /**
   * Generate PDF for a settlement report
   */
  regeneratePdf(report: any): void {
    report.isGeneratingPdf = true;
    
    try {
      const doc = new jsPDF();
      const title = "Relevé d'encaissement – Mandat de gestion des ventes";
      const startDate = this.formatDate(report.period_start_date);
      const endDate = this.formatDate(report.period_end_date);
      const amount = this.formatCurrency(report.amount);
      const commission = this.formatCurrency(report.commission);
      const advances = this.formatCurrency(report.amount - report.commission);
      const today = this.formatDate(new Date().toISOString().split('T')[0]);
      const photographer = this.getPhotographerName(report.photographer_id);
      const photographerDetails = this.photographersDetailsMap.get(report.photographer_id) || {};

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

      // Photographer info (right side)
      doc.text(photographer || '', 200, 32, { align: 'right' });
      doc.text(photographerDetails.street_address || 'Adresse photographe', 200, 38, { align: 'right' });
      const cityPostal = `${photographerDetails.locality || ''} - ${photographerDetails.postal_code || ''}`;
      doc.text(cityPostal, 200, 44, { align: 'right' });
      doc.text(photographerDetails.email || 'Email photographe', 200, 50, { align: 'right' });

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

      const fileName = `releve-encaissement-${photographer.replace(/\s+/g, '_')}-${report.period_end_date || today}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert('Erreur lors de la génération du PDF');
    } finally {
      report.isGeneratingPdf = false;
    }
  }

  /**
   * Wrap text to fit within a specified width
   */
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
