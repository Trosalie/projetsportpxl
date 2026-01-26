import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClientService } from '../services/client-service.service';
import { PhotographerService } from '../services/photographer-service';
import { InvoiceService } from '../services/invoice-service';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-profile-information',
  standalone: false,
  templateUrl: './profile-information.html',
  styleUrl: './profile-information.scss',
})
export class ProfileInformation implements OnInit {
  @ViewChild('lineChartCanvas') lineChartCanvas!: ElementRef<HTMLCanvasElement>;

  // Données du profil
  protected remainingCredits: number = 0;
  protected turnover: number = 0;
  protected name: string = '';
  protected family_name: string = '';
  protected given_name: string = '';
  protected email: string = '';
  protected street_address: string = '';
  protected locality: string = '';
  protected postal_code: string = '';
  protected country: string = '';
  protected isLoading: boolean = true;
  findPhotographer: boolean = false;
  photographerId: string | null = null;

  // Graphique
  lineChart: Chart | null = null;
  private rawInvoices: any[] = [];

  // Filtres
  protected openDropdown: string | null = null;
  protected activeFilters: string[] = ['Chiffre d\'affaire'];
  protected dateFilters: Map<string, string> = new Map();
  protected readonly dataTypeFilters = ['Chiffre d\'affaire', 'Crédits vendus'];
  protected readonly periodFilters = ['Après le', 'Avant le'];

  constructor(
    private photographerService: PhotographerService,
    private clientService: ClientService,
    private invoiceService: InvoiceService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.photographerId = this.route.snapshot.paramMap.get('id');

    if (!this.photographerId) {
      this.findPhotographer = false;
      this.isLoading = false;
      return;
    }

    this.clientService.getPhotographer(this.photographerId).subscribe({
      next: (data) => {
        if (data && data.email) {
          this.findPhotographer = true;
          this.email = data.email;
          this.family_name = data.family_name;
          this.given_name = data.given_name;
          this.name = data.name;
          this.remainingCredits = data.total_limit - data.nb_imported_photos;
          this.street_address = data.street_address;
          this.postal_code = data.postal_code;
          this.locality = data.locality;
          this.country = data.country;
          this.loadFinancialData();
        } else {
          this.findPhotographer = false;
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error('Error fetch photographer :', err);
        this.findPhotographer = false;
        this.isLoading = false;
      }
    });
  }

  private loadFinancialData() {
    if (!this.name) return;

    this.photographerService.getPhotographerIdsByName(this.name).subscribe({
      next: (data) => {
        if (data && data.client_id) {
          // Correction de l'erreur TypeScript (string | null -> number)
          const idAsNumber = Number(data.client_id);
          
          if (!isNaN(idAsNumber)) {
            this.invoiceService.getInvoicesPaymentByPhotographer(idAsNumber).subscribe(invoices => {
              this.rawInvoices = invoices || [];
              this.calculateTotals();
              // Un court délai permet à Angular d'afficher le canvas dans le DOM avant d'initialiser Chart.js
              setTimeout(() => this.updateChart(), 200);
              this.isLoading = false;
            });
          }
        } else {
          this.isLoading = false;
        }
      },
      error: () => this.isLoading = false
    });
  }

  private calculateTotals() {
    this.turnover = this.rawInvoices.reduce((sum, inv) => sum + Number(inv.raw_value || 0), 0);
  }

  private updateChart() {
    if (!this.lineChartCanvas) return;

    const filteredData = this.filterByDate(this.rawInvoices);
    const grouped = this.groupByMonth(filteredData);
    
    const labels = grouped.map(g => g.month);
    const values = grouped.map(g => g.amount);

    if (this.lineChart) {
      this.lineChart.destroy();
    }

    this.lineChart = new Chart(this.lineChartCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Chiffre d\'affaire (€)',
          data: values,
          borderColor: '#F98524',
          backgroundColor: 'rgba(249, 133, 36, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }

  private filterByDate(data: any[]) {
    let filtered = [...data];
    const after = this.dateFilters.get('Après le');
    const before = this.dateFilters.get('Avant le');
    if (after) filtered = filtered.filter(i => i.issue_date >= after);
    if (before) filtered = filtered.filter(i => i.issue_date <= before);
    return filtered;
  }

  private groupByMonth(data: any[]) {
    const map: { [key: string]: number } = {};
    data.forEach(item => {
      const month = item.issue_date ? item.issue_date.slice(0, 7) : 'Inconnu';
      map[month] = (map[month] || 0) + Number(item.raw_value || 0);
    });
    return Object.keys(map).sort().map(m => ({ month: m, amount: map[m] }));
  }

  // Méthodes de gestion des Filtres
  toggleDropdown(dropdownType: string, event: Event) {
    event.stopPropagation();
    this.openDropdown = this.openDropdown === dropdownType ? null : dropdownType;
  }

  toggleFilter(filterValue: string) {
    const index = this.activeFilters.indexOf(filterValue);
    if (index > -1) {
      this.activeFilters.splice(index, 1);
    } else {
      this.activeFilters.push(filterValue);
    }
  }

  isFilterActive = (val: string) => this.activeFilters.includes(val);
  hasActiveDataTypeFilters = () => this.activeFilters.some(f => this.dataTypeFilters.includes(f));
  hasActivePeriodFilters = () => this.activeFilters.some(f => this.periodFilters.includes(f));

  addDateFilter(filterValue: string) {
    if (!this.activeFilters.includes(filterValue)) {
      this.activeFilters.push(filterValue);
    }
  }

  updateDateFilter(filterValue: string, event: Event) {
    const input = event.target as HTMLInputElement;
    this.dateFilters.set(filterValue, input.value);
  }

  getDateValue = (filterValue: string) => this.dateFilters.get(filterValue) || '';

  clearCategoryFilters(category: string, event: Event): void {
    event.stopPropagation();
    const targets = category === 'dataType' ? this.dataTypeFilters : this.periodFilters;
    this.activeFilters = this.activeFilters.filter(f => !targets.includes(f));
    if (category === 'period') this.dateFilters.clear();
  }

  canApplyFilters = () => this.activeFilters.length > 0;

  applyFilters(): void {
    this.updateChart();
    this.openDropdown = null;
  }
}