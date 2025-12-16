import { Component } from '@angular/core';
import { AuthService } from '../services/auth-service';

@Component({
  selector: 'app-photographer-dashboard',
  standalone: false,
  templateUrl: './photographer-dashboard.html',
  styleUrl: './photographer-dashboard.scss',
})
export class PhotographerDashboard {

  constructor(private authService: AuthService) {}

  protected remainingCredits = 0;

  ngOnInit() {
    const user = this.authService.getUser();
    if (user) {
      this.remainingCredits = user.total_limit - user.nb_imported_photos;
    }
  }
}
