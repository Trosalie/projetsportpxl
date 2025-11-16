import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-invoice-filter',
  standalone: false,
  templateUrl: './invoice-filter.html',
  styleUrl: './invoice-filter.scss',
})
export class InvoiceFilter {
  protected isFilterModalOpen: boolean = false;
  protected selectedFilterType: string | null = null;
  protected activeFilters: string[] = [];
  protected dateFilters: Map<string, string> = new Map();

  private readonly statusFilters = ['Payée', 'Non payée', 'En retard'];
  private readonly typeFilters = ['Achat de crédits', 'Versement'];
  private readonly periodFilters = ['Après le', 'Avant le'];

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
    
    // Focus on the specific date input that was just added
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

  hasAvailablePeriodFilters(): boolean {
    return this.periodFilters.some(filter => !this.activeFilters.includes(filter));
  }

  hasAvailableFilters(): boolean {
    return this.hasAvailableStatusFilters() || 
           this.hasAvailableTypeFilters() || 
           this.hasAvailablePeriodFilters();
  }

  getSortedFilters(): string[] {
    // Define the order: Status filters first, then Type filters, then Period filters
    const orderedFilters = [
      ...this.statusFilters,
      ...this.typeFilters,
      ...this.periodFilters
    ];

    // Sort activeFilters based on the order defined above
    return this.activeFilters.sort((a, b) => {
      const indexA = orderedFilters.indexOf(a);
      const indexB = orderedFilters.indexOf(b);
      return indexA - indexB;
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (this.isFilterModalOpen) {
      this.isFilterModalOpen = false;
      this.selectedFilterType = null;
    }
  }
}
