import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PhotographerService } from '../services/photographer-service';

@Component({
  selector: 'app-admin-photographer-invoice-list',
  standalone: false,
  templateUrl: './admin-photographer-invoice-list.html',
  styleUrl: './admin-photographer-invoice-list.scss',
})
export class AdminPhotographerInvoiceList implements OnInit, OnDestroy {
  photographerId: string = '';
  photographerName: string = '';
  pennylaneId: string = '';
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private photographerService: PhotographerService
  ) {}

  ngOnInit() {
    // Récupérer l'ID depuis l'URL
    this.photographerId = this.route.snapshot.paramMap.get('id') || '';
    
    // Récupérer le nom depuis les queryParams (optionnel)
    this.photographerName = this.route.snapshot.queryParamMap.get('name') || '';
    
    // Si pas d'ID, rediriger
    if (!this.photographerId) {
      this.router.navigate(['/photographers']);
      return;
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goBack() {
    this.router.navigate(['/photographers']);
  }
}
