import { ActivatedRoute, Router } from '@angular/router';
import { InvoicePayment } from '../models/invoice-payment.model';
import { App } from '../app';
import { Popup } from '../popup/popup';
import { type InvoiceData } from '../confirm-modal/confirm-modal';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { PhotographerService } from '../services/photographer-service';
import { InvoiceService } from '../services/invoice-service';
import { AuthService } from '../services/auth-service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Chart, registerables } from 'chart.js';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { RoleService } from '../services/role.service';

Chart.register(...registerables);

@Component({
  selector: 'app-profile-information',
  standalone: false,
  templateUrl: './profile-information.html',
  styleUrls: ['./profile-information.scss'],
})

export class ProfileInformation implements OnInit {
  @ViewChild('lineChartCanvas') lineChartCanvas!: ElementRef<HTMLCanvasElement>;

  protected isLoading: boolean = true;
  protected findPhotographer: boolean = false;
  protected role: string | null = null;

  @ViewChild('popup') popup!: Popup;

  protected name: string = '';
  protected family_name: string = '';
  protected given_name: string = '';
  protected email: string = '';
  protected street_address: string = '';
  protected locality: string = '';
  protected postal_code: string = '';
  protected country: string = '';
  protected numberSell: number = 0;
  protected isDeleting: boolean = false;
  protected showDeleteModal: boolean = false;
  protected showPasswordModal: boolean = false;
  protected passwordModalData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  protected passwordModalLoading: boolean = false;
  protected passwordModalError: string = '';
  protected passwordModalSuccess: string = '';
  protected deleteModalData: InvoiceData | null = null;
  protected deleteTargetId: number | null = null;
  protected id: string | null = null;
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

  constructor(
    private photographerService: PhotographerService,
    private invoiceService: InvoiceService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private http: HttpClient,
    private roleService: RoleService,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    const role = this.roleService.getRole();
    this.role = role;
    
    // Si aucun ID n'est fourni, charger l'utilisateur authentifié (route /my-profile)
    if (!id) {
      const user = this.authService.getUser();
      if (user && user.id) {
        this.loadPhotographerProfile(user.id.toString());
      } else {
        this.isLoading = false;
      }
      return;
    }

    // Sinon, charger le photographe avec l'ID fourni
    this.loadPhotographerProfile(id);
  }

  private loadPhotographerProfile(id: string) {
    this.photographerService.getPhotographer(id).subscribe({
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
          this.id = id;
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
        const idNum = Number(ids?.photographerId);
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
    this.dateFilters.set(v, event.target.value);
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

  openDeleteModal() {
    if (this.isDeleting) {
      return;
    }

    const rawId = this.id;
    const id = rawId ? Number(rawId) : NaN;

    if (!rawId || Number.isNaN(id)) {
      this.popup.showNotification('Aucun photographe à supprimer.');
      return;
    }

    const photographerName = (this.family_name || this.name)
      ? `${this.family_name || this.name} ${this.given_name || ''}`.trim()
      : 'Photographe';

    this.deleteModalData = {
      title: photographerName,
      amount: 0,
      discount: 0,
      items: [
        { label: 'Email', value: this.email || '-' },
        { label: 'ID', value: id }
      ]
    };

    this.deleteTargetId = id;
    this.showDeleteModal = true;
  }

  onCancelDelete() {
    this.showDeleteModal = false;
    this.deleteTargetId = null;
  }

  onConfirmDelete() {
    if (this.isDeleting || this.deleteTargetId === null) {
      return;
    }

    const id = this.deleteTargetId;
    this.isDeleting = true;
    this.showDeleteModal = false;

    this.photographerService.deletePhotographer(id).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.popup.showNotification('Photographe supprimé avec succès !');
          setTimeout(() => {
            this.router.navigate(['/photographers']);
          }, 1000);
        } else {
          this.popup.showNotification(response.message || 'Erreur lors de la suppression du photographe.');
          this.isDeleting = false;
        }
      },
      error: (error) => {
        console.error('Error deleting photographer:', error);
        let errorMessage = 'Erreur lors de la suppression du photographe.';

        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.status === 404) {
          errorMessage = 'Photographe introuvable.';
        }

        this.popup.showNotification(errorMessage);
        this.isDeleting = false;
      }
    });
  }

  openPasswordModal() {
    this.showPasswordModal = true;
    this.passwordModalData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    this.passwordModalError = '';
    this.passwordModalSuccess = '';
  }

  closePasswordModal() {
    this.showPasswordModal = false;
  }

  changePassword() {
    this.passwordModalError = '';
    this.passwordModalSuccess = '';

    // Validation
    if (!this.passwordModalData.currentPassword || !this.passwordModalData.newPassword || !this.passwordModalData.confirmPassword) {
      this.passwordModalError = 'Veuillez remplir tous les champs.';
      return;
    }

    if (this.passwordModalData.newPassword.length < 8) {
      this.passwordModalError = 'Le nouveau mot de passe doit contenir au moins 8 caractères.';
      return;
    }

    if (this.passwordModalData.newPassword !== this.passwordModalData.confirmPassword) {
      this.passwordModalError = 'Les mots de passe ne correspondent pas.';
      return;
    }

    if (this.passwordModalData.currentPassword === this.passwordModalData.newPassword) {
      this.passwordModalError = 'Le nouveau mot de passe doit être différent de l\'ancien.';
      return;
    }

    this.passwordModalLoading = true;

    const payload = {
      current_password: this.passwordModalData.currentPassword,
      password: this.passwordModalData.newPassword,
      password_confirmation: this.passwordModalData.confirmPassword,
    };

    const token = this.authService.getToken();
    this.http.post(
      `${environment.apiUrl}/change-password`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      }
    ).subscribe({
      next: () => {
        this.passwordModalSuccess = 'Mot de passe changé avec succès !';
        this.passwordModalLoading = false;
        setTimeout(() => {
          this.closePasswordModal();
        }, 1500);
      },
      error: (err) => {
        this.passwordModalLoading = false;
        if (err.status === 422) {
          this.passwordModalError = 'Le mot de passe actuel est incorrect.';
        } else if (err.error?.message) {
          this.passwordModalError = err.error.message;
        } else {
          this.passwordModalError = 'Une erreur est survenue. Veuillez réessayer.';
        }
      }
    });
  }
}

