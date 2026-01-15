import { Component, EventEmitter, Output, OnDestroy } from '@angular/core';
import { PhotographerService } from '../services/photographer-service';
import { InvoiceService } from '../services/invoice-service';
import { AuthService } from '../services/auth-service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-photographers-list',
  standalone: false,
  templateUrl: './photographers-list.html',
  styleUrls: ['./photographers-list.scss'],
})
export class PhotographersList implements OnDestroy {
  protected photographers: any[] = [];
  protected renderedList: any[] = [];
  protected itemsToShow: number = 20;
  protected bufferedList: any[] = [];
  protected filterActive: boolean = false;
  protected invoicesMap: any = {}; // Map des invoices par photographer_id
  private destroy$ = new Subject<void>();

  constructor(
    private photographerService: PhotographerService, 
    private invoiceService: InvoiceService,
    private authService: AuthService
  ) {
    this.authService.logout$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.destroy$.next();
    });
  }

  ngOnInit() {
    this.photographerService.getPhotographers()
      .pipe(takeUntil(this.destroy$))
      .subscribe(photographers => {
        this.photographers = photographers;
        this.renderedList = this.photographers.slice(0, this.itemsToShow);
        
        // Charger les invoices pour les 20 photographes en UNE SEULE requête
        this.loadInvoicesForPhotographers(this.renderedList);
      });
  }

  private loadInvoicesForPhotographers(photoList: any[]): void {
    const photographerIds = photoList.map(p => p.id);
    if (photographerIds.length === 0) return;

    this.invoiceService.getBulkInvoicesByPhotographers(photographerIds)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        data => {
          this.invoicesMap = data;
        },
        error => {
          console.error('ERROR loading bulk invoices:', error);
        }
      );
  }

  onFilterChange(query: string) {
    const fieldsToFilter = ['name', 'email'];
    const normalizedQuery = query.trim().toLowerCase();

    if (normalizedQuery === '') {
      this.renderedList = this.photographers.slice(0, this.itemsToShow);
      this.filterActive = false;
    } else {
      this.bufferedList = this.photographers.filter(photographer =>
        fieldsToFilter.some(field =>
          this.matchesQuery(photographer[field], normalizedQuery)
        )
      );
      this.renderedList = this.bufferedList.slice(0, this.itemsToShow);
      this.filterActive = true;
    }
    
    // Recharger les invoices pour la nouvelle liste affichée
    this.loadInvoicesForPhotographers(this.renderedList);
  }

  onPageChange(newList: any[]): void {
    this.loadInvoicesForPhotographers(newList);
  }

  private matchesQuery(fieldValue: unknown, normalizedQuery: string): boolean {
    if (!fieldValue) return false;

    const normalizedValue = fieldValue.toString().toLowerCase();
    return normalizedValue.startsWith(normalizedQuery) || normalizedValue.includes(` ${normalizedQuery}`);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}