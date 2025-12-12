import { Component } from '@angular/core';
import { ClientService } from '../services/client-service.service';
import {InvoiceService} from '../services/invoice-service';
import {InvoicePayment} from '../models/invoice-payment.model';
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
  protected remainingCredits: number = 0
  protected turnover: number = 0
  protected name: string = ''
  protected family_name: string = ''
  protected given_name: string = ''
  protected email: string = ''
  protected street_address: string = ''
  protected locality: string = ''
  protected postal_code: string = ''
  protected country: string = ''
  protected numberSell: number = 0 // comment que je le trouve
  photographerEmail: string|null = null
  findPhotographer: boolean = false

  constructor(private clientService: ClientService, private invoiceService: InvoiceService) {}

  ngOnInit()
  {
    this.photographerEmail = localStorage.getItem('currentPhotographerEmail');
    if (!this.photographerEmail)
    {
      return
    }

    this.clientService.getPhotographerByEmail(this.photographerEmail).subscribe(
      {
        next: (data) => {
          if (data && data.email)
          {
            this.findPhotographer = true
            this.email = data.email
            this.family_name = data.family_name
            this.given_name = data.given_name
            this.name = data.name
            this.remainingCredits = data.total_limit - data.nb_imported_photos
            this.street_address = data.street_address
            this.postal_code = data.postal_code
            this.locality = data.locality
            this.country = data.country
          }
          else
          {
            this.findPhotographer = false
          }
        },
        error: (err) => {
          console.error('Error fetch photographer :', err);
          this.findPhotographer = false;
        }
      }
    )

    if (this.findPhotographer && this.name)
    {
      const body = { name: this.name };
      this.clientService.getClientIdByName(body).subscribe({
        next: (data) =>
        {
          if (data && data.client_id)
          {
            this.invoiceService.getInvoicesByClient(data.client_id).subscribe(invoices => {
              let invoicesTemp = invoices
              this.turnover = 0
              for (let invoice of invoicesTemp) {
                if (invoice instanceof InvoicePayment)
                {
                  this.turnover += invoice.commission + invoice.raw_value
                }
              }
            })
          }
        }
      })
    }
  }
}
