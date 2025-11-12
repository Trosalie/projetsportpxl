import { Component } from '@angular/core';

@Component({
  selector: 'app-invoice-filter',
  standalone: false,
  templateUrl: './invoice-filter.html',
  styleUrl: './invoice-filter.scss',
})
export class InvoiceFilter {
  protected showFilterBox: boolean = false;

  toggleFilterBox() {
    this.showFilterBox = !this.showFilterBox;
  }
}
