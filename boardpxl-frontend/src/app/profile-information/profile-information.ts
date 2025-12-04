import { Component } from '@angular/core';
import { ClientService } from '../services/client-service.service';

@Component({
  selector: 'app-profile-information',
  standalone: false,
  templateUrl: './profile-information.html',
  styleUrl: './profile-information.scss',
})

export class ProfileInformation
{
  constructor(private clientService: ClientService) {}

  ngOnInit()
  {
    this.clientService.getPhotographerById('208474147')
  }

  protected remainingCredits = 50;  // change to actual number
  protected turnover = 50;          // change to actual number
  protected name = 'Test User';        // change to actual name
  protected firstName = 'Test User';   // change to actual name
  protected email = 'test@test';      // change to actual email
  protected numberSell = 50;        // change to actual number
}
