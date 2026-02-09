import { Component, HostListener, EventEmitter, Output } from '@angular/core';

export interface FilterOptions {
  statusFilters: string[];
  typeFilters: string[];
  periodFilters: {
    startDate: string;
    endDate: string;
  };
}

@Component({
  selector: 'app-invoice-filter',
  standalone: false,
  templateUrl: './invoice-filter.html',
  styleUrl: './invoice-filter.scss',
})
export class InvoiceFilter {
  @Output() filtersChanged = new EventEmitter<FilterOptions>();

  protected openDropdown: string | null = null;
  protected activeFilters: string[] = [];
  protected dateFilters: Map<string, string> = new Map();

  protected readonly statusFilters = ['Payée', 'Non payée', 'En retard'];
  protected readonly typeFilters = ['Achat de crédits', 'Versement'];
  protected readonly periodFilters = ['Après le', 'Avant le'];

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
    this.emitFilterChange();
  }

  removeFilter(filterValue: string) {
    this.activeFilters = this.activeFilters.filter(f => f !== filterValue);
    if (this.isDateFilter(filterValue)) {
      this.dateFilters.delete(filterValue);
    }
    this.emitFilterChange();
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

    // Focus on the specific date input that was just added
    setTimeout(() => {
      const input = document.querySelector(`.date-input[data-filter="${filterValue}"]`) as HTMLInputElement;
      if (input) {
        input.focus();
        input.showPicker?.();
      }
    }, 100);

    this.emitFilterChange();
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
      this.emitFilterChange();
    } else {
      // Reset to previous value if invalid
      input.value = this.dateFilters.get(filterValue) || '';
      // Show error message
      alert(this.translate.instant('INVOICE_FILTER.ALERT_UPDATE_DATE_FILTER'));
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

  hasActiveStatusFilters(): boolean {
    return this.activeFilters.some(f => this.statusFilters.includes(f));
  }

  hasActiveTypeFilters(): boolean {
    return this.activeFilters.some(f => this.typeFilters.includes(f));
  }

  hasActivePeriodFilters(): boolean {
    return this.activeFilters.some(f => this.periodFilters.includes(f));
  }

  clearCategoryFilters(category: string, event: Event): void {
    event.stopPropagation();

    let filtersToRemove: string[] = [];

    switch(category) {
      case 'status':
        filtersToRemove = this.statusFilters;
        break;
      case 'type':
        filtersToRemove = this.typeFilters;
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

  private emitFilterChange(): void {
    const filterOptions: FilterOptions = {
      statusFilters: this.activeFilters.filter(f => this.statusFilters.includes(f)),
      typeFilters: this.activeFilters.filter(f => this.typeFilters.includes(f)),
      periodFilters: {
        startDate: this.dateFilters.get('Après le') || '',
        endDate: this.dateFilters.get('Avant le') || ''
      },
    };

    this.filtersChanged.emit(filterOptions);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (this.openDropdown) {
      this.openDropdown = null;
    }
  }
}
