import { Component, Input, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientService } from '../services/client-service.service';
import { PhotographerService } from '../services/photographer-service';
import { InvoiceService } from '../services/invoice-service';
import { InvoicePayment } from '../models/invoice-payment.model';
import { App } from '../app';
import { Popup } from '../popup/popup';
import { type InvoiceData } from '../confirm-modal/confirm-modal';

const app = new App();
@Component({
  selector: 'app-profile-information',
  standalone: false,
  templateUrl: './profile-information.html',
  styleUrl: './profile-information.scss',
})

export class ProfileInformation
{
  @ViewChild('popup') popup!: Popup;

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
  protected numberSell: number = 0;
  protected isLoading: boolean = true;
  protected isDeleting: boolean = false;
  protected showDeleteModal: boolean = false;
  protected deleteModalData: InvoiceData | null = null;
  protected deleteTargetId: number | null = null;
  findPhotographer: boolean = false;
  photographerId: string | null = null;

  // Filter properties
  protected openDropdown: string | null = null;
  protected activeFilters: string[] = [];
  protected dateFilters: Map<string, string> = new Map();
  protected readonly dataTypeFilters = ['Chiffre d\'affaire', 'Crédits vendus'];
  protected readonly periodFilters = ['Après le', 'Avant le'];

  constructor(
    private photographerService: PhotographerService,
    private clientService: ClientService,
    private invoiceService: InvoiceService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit()
  {
    this.photographerId = this.route.snapshot.paramMap.get('id')

    if (!this.photographerId)
    {
      this.findPhotographer = false;
      return;
    }

    this.clientService.getPhotographer(this.photographerId).subscribe(
      {
        next: (data) => {
          if (data && data.email)
          {
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
            this.loadTurnover();
            this.isLoading = false;
          }
          else
          {
            this.findPhotographer = false;
            this.isLoading = false;
          }
        },
        error: (err) => {
          console.error('Error fetch photographer :', err);
          this.findPhotographer = false;
          this.isLoading = false;
        }
      }
    )
  }

  private loadTurnover()
  {
    if (!this.findPhotographer || !this.name)
    {
      return;
    }

    const body = { name: this.name };
    this.photographerService.getPhotographerIdsByName(body.name).subscribe({
      next: (data) =>
      {
        if (data && data.client_id)
        {
          this.invoiceService.getInvoicesPaymentByPhotographer(data.client_id).subscribe(invoices => {
            const invoicesTemp = invoices;
            this.turnover = 0;
            for (const invoice of invoicesTemp) {
              this.turnover += Number(invoice.raw_value);
            }
          })
        }
      }
    })
  }

  // Filter Methods (Mock implementation)
  toggleDropdown(dropdownType: string, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.openDropdown = this.openDropdown === dropdownType ? null : dropdownType;
  }

  toggleFilter(filterValue: string) {
    if (this.activeFilters.includes(filterValue)) {
      this.removeFilter(filterValue);
    } else {
      this.addFilter(filterValue);
    }
  }

  addFilter(filterValue: string) {
    if (!this.activeFilters.includes(filterValue)) {
      this.activeFilters.push(filterValue);
    }
  }

  removeFilter(filterValue: string) {
    this.activeFilters = this.activeFilters.filter(f => f !== filterValue);
    if (this.isDateFilter(filterValue)) {
      this.dateFilters.delete(filterValue);
    }
  }

  isFilterActive(filterValue: string): boolean {
    return this.activeFilters.includes(filterValue);
  }

  isDateFilter(filterValue: string): boolean {
    return this.periodFilters.includes(filterValue);
  }

  addDateFilter(filterValue: string) {
    if (!this.activeFilters.includes(filterValue)) {
      this.activeFilters.push(filterValue);
      this.dateFilters.set(filterValue, '');
    }

    setTimeout(() => {
      const input = document.querySelector(`.date-input[data-filter="${filterValue}"]`) as HTMLInputElement;
      if (input) {
        input.focus();
        input.showPicker?.();
      }
    }, 100);
  }

  getDateValue(filterValue: string): string {
    return this.dateFilters.get(filterValue) || '';
  }

  updateDateFilter(filterValue: string, event: Event) {
    const input = event.target as HTMLInputElement;
    const newValue = input.value;

    if (this.isDateRangeValid(filterValue, newValue)) {
      this.dateFilters.set(filterValue, newValue);
    }
  }

  private isDateRangeValid(filterValue: string, newValue: string): boolean {
    // Mock implementation - just allow any valid date
    return newValue !== '';
  }

  hasActiveDataTypeFilters(): boolean {
    return this.activeFilters.some(f => this.dataTypeFilters.includes(f));
  }

  hasActivePeriodFilters(): boolean {
    return this.activeFilters.some(f => this.periodFilters.includes(f));
  }

  clearCategoryFilters(category: string, event: Event): void {
    event.stopPropagation();

    let filtersToRemove: string[] = [];

    switch(category) {
      case 'dataType':
        filtersToRemove = this.dataTypeFilters;
        break;
      case 'period':
        filtersToRemove = this.periodFilters;
        break;
    }

    filtersToRemove.forEach(filter => {
      if (this.activeFilters.includes(filter)) {
        this.removeFilter(filter);
      }
    });
  }

  canApplyFilters(): boolean {
    return this.hasActiveDataTypeFilters() || this.hasActivePeriodFilters();
  }

  applyFilters(): void {
    // Mock implementation - for now just log the filters
    console.log('Applied filters:', this.activeFilters);
    console.log('Date filters:', this.dateFilters);
    // TODO: Implement actual filtering logic when graph is ready
  }

  openDeleteModal() {
    if (this.isDeleting) {
      return;
    }

    const rawId = this.photographerId;
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
}
