import { Component } from '@angular/core';

@Component({
  selector: 'app-photographer-dashboard',
  standalone: false,
  templateUrl: './photographer-dashboard.html',
  styleUrl: './photographer-dashboard.scss',
})
export class PhotographerDashboard {
  protected remainingCredits = 50;
}
