import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-reset-password-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-password-page.html',
  styleUrls: ['./reset-password-page.scss']
})
export class ResetPasswordPageComponent {
  email: string = '';
  token: string = '';
  password: string = '';
  password_confirmation: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {
    // Récupère le token et l'email de l'URL
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      this.email = params['email'] || '';
      
      if (!this.token || !this.email) {
        this.errorMessage = 'Lien invalide ou expiré.';
      }
    });
  }

  resetPassword(): void {
    // Validation
    if (this.password.length < 8) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 8 caractères.';
      return;
    }

    if (this.password !== this.password_confirmation) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.resetPassword(this.email, this.token, this.password, this.password_confirmation).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Mot de passe réinitialisé avec succès. Redirection vers la connexion...';
        
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Erreur lors de la réinitialisation du mot de passe.';
      }
    });
  }
}
