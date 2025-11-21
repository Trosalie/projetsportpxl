import { Component } from '@angular/core';

@Component({
  selector: 'app-photograph-dashboard',
  standalone: false,
  templateUrl: './photograph-dashboard.html',
  styleUrl: './photograph-dashboard.scss',
})
export class PhotographDashboard {
  protected remainingCredits = 50;
}
