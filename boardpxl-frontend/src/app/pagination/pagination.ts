import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: false,
  templateUrl: './pagination.html',
  styleUrl: './pagination.scss',
})
export class Pagination {
  @Input() numberOfItems: number = 0;
  @Input() fullList: any[] = [];
  @Input() renderedList: any[] = [];
  protected currentPageNumber: number = 1;

  get totalPages(): number {
    if (this.numberOfItems <= 0) {
      return 0;
    }
    return Math.ceil(this.fullList.length / this.numberOfItems);
  }

  get currentPage(): number {
    return this.currentPageNumber;
  }

  goToPage(page: number) {
    const startIndex = (page - 1) * this.numberOfItems;
    const endIndex = startIndex + this.numberOfItems;
    this.renderedList.splice(0, this.renderedList.length, ...this.fullList.slice(startIndex, endIndex));
    this.currentPageNumber = page;
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  goToFirst() {
    this.goToPage(1);
  }

  goToLast() {
    this.goToPage(this.totalPages);
  }
}