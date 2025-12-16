import { Component, EventEmitter, Output, OnDestroy } from '@angular/core';
import { PhotographerService } from '../services/photographer-service';
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
  private destroy$ = new Subject<void>();

  constructor(private photographerService: PhotographerService, private authService: AuthService) {
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
      });
  }

  onFilterChange(query: string) {
    let fieldsToFilter = ['name', 'email'];
    if (query.trim() === '') {
      this.renderedList = this.photographers.slice(0, this.itemsToShow);
      this.filterActive = false;
    } else {
      this.bufferedList = this.photographers.filter(photographer =>
        fieldsToFilter.some(field =>
          photographer[field]?.toString().toLowerCase().includes(query.toLowerCase())
        )
      );
      this.renderedList = this.bufferedList.slice(0, this.itemsToShow);
      this.filterActive = true;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}