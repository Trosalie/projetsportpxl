import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClientService } from '../services/client-service.service';
import { PhotographerService } from '../services/photographer-service';
import { InvoiceService } from '../services/invoice-service';
import { InvoicePayment } from '../models/invoice-payment.model';
import { App } from '../app';

const app = new App();
@Component({
  selector: 'app-profile-information',
  standalone: false,
  templateUrl: './profile-information.html',
  styleUrl: './profile-information.scss',
})

export class ProfileInformation
{
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
  findPhotographer: boolean = false;
  photographerId: string | null = null;

  constructor(
    private photographerService: PhotographerService,
    private clientService: ClientService,
    private invoiceService: InvoiceService,
    private route: ActivatedRoute,
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
          this.invoiceService.getInvoicesByClient(data.client_id).subscribe(invoices => {
            const invoicesTemp = invoices;
            this.turnover = 0;
            for (const invoice of invoicesTemp) {
              if (invoice instanceof InvoicePayment)
              {
                this.turnover += invoice.turnover;
              }
            }
          })
        }
      }
    })
  }
}
