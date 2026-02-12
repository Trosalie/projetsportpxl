import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClientService } from '../services/client-service.service';
import { PhotographerService } from '../services/photographer-service';
import { InvoiceService } from '../services/invoice-service';
import { Chart, registerables } from 'chart.js';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

Chart.register(...registerables);

@Component({
  selector: 'app-profile-information',
  standalone: false,
  templateUrl: './profile-information.html',
  styleUrl: './profile-information.scss',
})
export class ProfileInformation implements OnInit {
  @ViewChild('lineChartCanvas') lineChartCanvas!: ElementRef<HTMLCanvasElement>;

  protected isLoading: boolean = true;
  protected findPhotographer: boolean = false;

  protected name: string = '';
  protected family_name: string = '';
  protected given_name: string = '';
  protected email: string = '';
  protected street_address: string = '';
  protected locality: string = '';
  protected postal_code: string = '';
  protected country: string = '';
  protected remainingCredits: number = 0;

  protected turnover: number = 0;
  protected totalCreditsInvoiced: number = 0;
  private rawInvoices: any[] = [];
  private rawCredits: any[] = [];

  lineChart: Chart | null = null;

  protected openDropdown: string | null = null;
  protected activeFilters: string[] = ["Chiffre d'affaire", 'Crédits facturés'];
  protected dateFilters: Map<string, string> = new Map();
  protected readonly dataTypeFilters = ["Chiffre d'affaire", 'Crédits facturés'];
  protected readonly periodFilters = ['Après le', 'Avant le'];
  protected dateError: string = '';

  constructor(
    private photographerService: PhotographerService,
    private clientService: ClientService,
    private invoiceService: InvoiceService,
    private route: ActivatedRoute,
  ) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.filter-dropdown-container')) {
      this.openDropdown = null;
    }
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.isLoading = false;
      return;
    }

    this.clientService.getPhotographer(id).subscribe({
      next: (data) => {
        if (data) {
          this.findPhotographer = true;
          this.name = data.name || '';
          this.family_name = data.family_name || '';
          this.given_name = data.given_name || '';
          this.email = data.email || '';
          this.street_address = data.street_address || '';
          this.locality = data.locality || '';
          this.postal_code = data.postal_code || '';
          this.country = data.country || '';
          this.remainingCredits = (data.total_limit || 0) - (data.nb_imported_photos || 0);
          this.loadFinancialData();
        } else {
          this.isLoading = false;
        }
      },
      error: () => (this.isLoading = false),
    });
  }

  private loadFinancialData() {
    if (!this.name) {
      this.isLoading = false;
      return;
    }

    this.photographerService.getPhotographerIdsByName(this.name).subscribe({
      next: (ids) => {
        const idNum = Number(ids?.client_id);
        if (!isNaN(idNum) && idNum !== 0) {
          forkJoin({
            payments: this.invoiceService
              .getInvoicesPaymentByPhotographer(idNum)
              .pipe(catchError(() => of([]))),
            credits: this.invoiceService
              .getBulkInvoicesByPhotographers([idNum])
              .pipe(catchError(() => of([]))),
          })
            .pipe(finalize(() => (this.isLoading = false)))
            .subscribe((res) => {
              this.rawInvoices = Array.isArray(res.payments)
                ? res.payments
                : res.payments
                  ? [res.payments]
                  : [];

              const bulkData = res.credits?.[idNum] || res.credits?.[String(idNum)] || {};
              this.rawCredits = Array.isArray(bulkData.credits) ? bulkData.credits : [];

              this.calculateTotals();
              setTimeout(() => this.updateChart(), 500);
            });
        } else {
          this.isLoading = false;
        }
      },
      error: () => (this.isLoading = false),
    });
  }

  private calculateTotals() {
    // CA classique
    this.turnover = this.rawInvoices.reduce((sum, inv) => sum + Number(inv.raw_value || 0), 0);

    // Crédits Facturés : Utilisation de 'total_due' comme vu sur ton image
    this.totalCreditsInvoiced = this.rawCredits.reduce((sum, cr) => {
      return sum + Number(cr.total_due || cr.amount || 0);
    }, 0);
  }

  private updateChart() {
    if (!this.lineChartCanvas) return;

    const filteredInvoices = this.filterByDate(this.rawInvoices);
    const filteredCredits = this.filterByDate(this.rawCredits);

    const groupedCA = this.groupByMonth(filteredInvoices, 'raw_value');
    // On groupe les crédits par 'total_due' pour le graphique
    const groupedCr = this.groupByMonth(filteredCredits, 'total_due');

    const allLabels = Array.from(
      new Set([...Object.keys(groupedCA), ...Object.keys(groupedCr)]),
    ).sort();

    if (this.lineChart) {
      this.lineChart.destroy();
    }

    this.lineChart = new Chart(this.lineChartCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: allLabels,
        datasets: [
          {
            label: "Chiffre d'affaire (€)",
            data: allLabels.map((m) => groupedCA[m] || 0),
            borderColor: '#F98524',
            backgroundColor: 'rgba(249, 133, 36, 0.1)',
            fill: true,
            tension: 0.4,
            hidden: !this.isFilterActive("Chiffre d'affaire"),
          },
          {
            label: 'Crédits facturés (€)',
            data: allLabels.map((m) => groupedCr[m] || 0),
            borderColor: '#4793DC',
            backgroundColor: 'rgba(71, 147, 220, 0.1)',
            fill: true,
            tension: 0.4,
            hidden: !this.isFilterActive('Crédits facturés'),
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true } },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 12,
              padding: 8,
              font: {
                size: window.innerWidth < 640 ? 10 : 12,
              },
            },
          },
        },
      },
    });
  }

  private filterByDate(data: any[]) {
    if (!Array.isArray(data)) return [];
    const after = this.dateFilters.get('Après le');
    const before = this.dateFilters.get('Avant le');

    return data.filter((i) => {
      const dateStr = i.issue_date; // Correspond à ta colonne image
      if (!dateStr) return true;
      if (after && dateStr < after) return false;
      if (before && dateStr > before) return false;
      return true;
    });
  }

  private groupByMonth(data: any[], key: string) {
    const map: { [key: string]: number } = {};
    if (!Array.isArray(data)) return map;

    data.forEach((item) => {
      const dateStr = item.issue_date;
      const month = dateStr ? dateStr.slice(0, 7) : 'Inconnu';
      const value = item[key] || item.total_due || 0;
      map[month] = (map[month] || 0) + Number(value);
    });
    return map;
  }

  // --- Méthodes de filtres inchangées ---
  toggleDropdown(type: string, event: Event) {
    event.stopPropagation();
    this.openDropdown = this.openDropdown === type ? null : type;
  }
  toggleFilter(val: string) {
    const i = this.activeFilters.indexOf(val);
    i > -1 ? this.activeFilters.splice(i, 1) : this.activeFilters.push(val);
    this.updateChart();
  }
  isFilterActive = (val: string) => this.activeFilters.includes(val);
  hasActiveDataTypeFilters = () => this.activeFilters.some((f) => this.dataTypeFilters.includes(f));
  hasActivePeriodFilters = () => this.activeFilters.some((f) => this.periodFilters.includes(f));
  addDateFilter(v: string) {
    if (!this.activeFilters.includes(v)) this.activeFilters.push(v);
  }
  updateDateFilter(v: string, event: any) {
    const value = event.target.value;
    this.dateFilters.set(v, value);
    this.validateDates();
    if (!this.dateError) {
      this.updateChart();
    }
  }
  private validateDates() {
    this.dateError = '';
    const today = new Date().toISOString().split('T')[0];
    const afterDate = this.dateFilters.get('Après le');
    const beforeDate = this.dateFilters.get('Avant le');

    if (afterDate && afterDate > today) {
      this.dateError = 'La date "Après le" ne peut pas être dans le futur';
      return;
    }
    if (beforeDate && beforeDate > today) {
      this.dateError = 'La date "Avant le" ne peut pas être dans le futur';
      return;
    }
    if (afterDate && beforeDate && afterDate > beforeDate) {
      this.dateError = 'La date "Après le" doit être antérieure à "Avant le"';
      return;
    }
  }
  getMaxDate(): string {
    return new Date().toISOString().split('T')[0];
  }
  getMinDateForBefore(): string {
    return this.dateFilters.get('Après le') || '';
  }
  getMaxDateForAfter(): string {
    const beforeDate = this.dateFilters.get('Avant le');
    const today = new Date().toISOString().split('T')[0];
    return beforeDate && beforeDate < today ? beforeDate : today;
  }
  getDateValue = (v: string) => this.dateFilters.get(v) || '';
  clearCategoryFilters(cat: string, event: Event) {
    event.stopPropagation();
    const targets = cat === 'dataType' ? this.dataTypeFilters : this.periodFilters;
    this.activeFilters = this.activeFilters.filter((f) => !targets.includes(f));
    if (cat === 'period') this.dateFilters.clear();
    this.updateChart();
  }
  canApplyFilters = () => this.activeFilters.length > 0;
  applyFilters() {
    this.updateChart();
    this.openDropdown = null;
  }
}
