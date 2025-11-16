import { Component, HostListener } from '@angular/core';
import { InvoicePayment } from '../models/invoice-payment.model';
import { InvoiceCredit } from '../models/invoice-credit.model';

@Component({
  selector: 'app-invoice-history',
  standalone: false,
  templateUrl: './invoice-history.html',
  styleUrl: './invoice-history.scss',
})
export class InvoiceHistory {
  protected invoices: any[] = [];
  protected isFilterModalOpen: boolean = false;
  protected selectedFilterType: string | null = null;
  protected activeFilters: string[] = [];
  protected dateFilters: Map<string, string> = new Map();

  private readonly statusFilters = ['Payée', 'Non payée', 'En retard'];
  private readonly typeFilters = ['Achat de crédits', 'Versement'];
  private readonly periodFilters = ['Après le', 'Avant le'];

  constructor() {
    // Sample data for demonstration purposes
    this.invoices = [new InvoicePayment('573709670175', new Date('2024-01-01'), new Date('2024-01-31'), 'Payment for January', 1000, 900, 100, 200, 50, new Date('2024-01-01'), new Date('2024-01-31'), 'link_to_pdf_1'),
                     new InvoicePayment('9Z-6465465432', new Date('2024-02-01'), new Date('2024-02-28'), 'Payment for February', 1200, 1100, 100, 240, 60, new Date('2024-02-01'), new Date('2024-02-28'), 'link_to_pdf_2'),
                     new InvoiceCredit('646213265445', new Date('2024-03-01'), new Date('2024-03-31'), 'Credit for March', 500, 100, 20, 420, 50, 'Non payée', 'link_to_pdf_3'),
                     new InvoiceCredit('573709670176', new Date('2024-04-01'), new Date('2024-04-30'), 'Credit for April', 600, 120, 24, 456, 60, 'En retard', 'link_to_pdf_4')
    ];
  }

  toggleFilterModal(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.isFilterModalOpen = !this.isFilterModalOpen;
    if (!this.isFilterModalOpen) {
      this.selectedFilterType = null;
    }
  }

  openFilterType(filterType: string) {
    this.selectedFilterType = filterType;
  }

  goBack() {
    this.selectedFilterType = null;
  }

  addFilter(filterValue: string) {
    if (!this.activeFilters.includes(filterValue)) {
      this.activeFilters.push(filterValue);
    }
    this.isFilterModalOpen = false;
    this.selectedFilterType = null;
  }

  removeFilter(filterValue: string) {
    this.activeFilters = this.activeFilters.filter(f => f !== filterValue);
    if (this.isDateFilter(filterValue)) {
      this.dateFilters.delete(filterValue);
    }
  }

  isDateFilter(filterValue: string): boolean {
    return this.periodFilters.includes(filterValue);
  }

  isFilterActive(filterValue: string): boolean {
    return this.activeFilters.includes(filterValue);
  }

  addDateFilter(filterValue: string) {
    if (!this.activeFilters.includes(filterValue)) {
      this.activeFilters.push(filterValue);
      this.dateFilters.set(filterValue, '');
    }
    this.isFilterModalOpen = false;
    this.selectedFilterType = null;
    
    // Focus on the date input after a short delay
    setTimeout(() => {
      const inputs = document.querySelectorAll('.date-input');
      const lastInput = inputs[inputs.length - 1] as HTMLInputElement;
      if (lastInput) {
        lastInput.focus();
        lastInput.showPicker?.();
      }
    }, 100);
  }

  getDateValue(filterValue: string): string {
    return this.dateFilters.get(filterValue) || '';
  }

  updateDateFilter(filterValue: string, event: Event) {
    const input = event.target as HTMLInputElement;
    const newValue = input.value;
    
    // Validate date range
    if (this.isDateRangeValid(filterValue, newValue)) {
      this.dateFilters.set(filterValue, newValue);
    } else {
      // Reset to previous value if invalid
      input.value = this.dateFilters.get(filterValue) || '';
      // Show error message
      alert('La date "Après le" doit être antérieure à la date "Avant le".');
    }
  }

  private isDateRangeValid(filterValue: string, newValue: string): boolean {
    if (!newValue) {
      return true; // Empty date is valid
    }

    const afterDate = filterValue === 'Après le' ? newValue : this.dateFilters.get('Après le');
    const beforeDate = filterValue === 'Avant le' ? newValue : this.dateFilters.get('Avant le');

    // If both dates are set, validate the range
    if (afterDate && beforeDate) {
      return new Date(afterDate) < new Date(beforeDate);
    }

    return true; // If only one date is set, it's valid
  }

  hasAvailableStatusFilters(): boolean {
    return this.statusFilters.some(filter => !this.activeFilters.includes(filter));
  }

  hasAvailableTypeFilters(): boolean {
    return this.typeFilters.some(filter => !this.activeFilters.includes(filter));
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (this.isFilterModalOpen) {
      this.isFilterModalOpen = false;
      this.selectedFilterType = null;
    }
  }

  ngOnInit() {
    setTimeout(() => {
      const el = document.querySelector('.invoice-list') as HTMLElement | null;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const y = rect.top + window.scrollY;
      el.style.height = `calc(100vh - ${y}px - 10px)`;
    }, 0);
  }

}