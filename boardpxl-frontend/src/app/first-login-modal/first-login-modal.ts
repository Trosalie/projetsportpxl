import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth-service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-first-login-modal',
  standalone: false,
  templateUrl: './first-login-modal.html',
  styleUrl: './first-login-modal.scss',
})
export class FirstLoginModalComponent implements OnInit {
  isVisible = false;
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  userName = '';

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    // Afficher la modal si c'est la première connexion
    if (this.authService.isFirstLogin()) {
      this.isVisible = true;
      const user = this.authService.getUser();
      this.userName = user?.given_name || user?.name || 'Utilisateur';
    }
  }

  closeModal() {
    if (!this.isLoading) {
      this.authService.clearFirstLoginFlag();
      this.isVisible = false;
    }
  }

  changePassword() {
    this.errorMessage = '';
    this.successMessage = '';

    // Validation
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }

    if (this.newPassword.length < 8) {
      this.errorMessage = 'Le nouveau mot de passe doit contenir au moins 8 caractères.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }

    if (this.currentPassword === this.newPassword) {
      this.errorMessage = 'Le nouveau mot de passe doit être différent de l\'ancien.';
      return;
    }

    this.isLoading = true;

    const payload = {
      current_password: this.currentPassword,
      password: this.newPassword,
      password_confirmation: this.confirmPassword,
    };

    const token = this.authService.getToken();
    this.http.post(
      `${environment.apiUrl}/change-password`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      }
    ).subscribe({
      next: () => {
        this.successMessage = 'Mot de passe changé avec succès !';
        this.isLoading = false;
        setTimeout(() => {
          this.authService.clearFirstLoginFlag();
          this.isVisible = false;
        }, 1500);
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 422) {
          this.errorMessage = 'Le mot de passe actuel est incorrect.';
        } else if (err.error?.message) {
          this.errorMessage = err.error.message;
        } else {
          this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
        }
      }
    });
  }

  skipPasswordChange() {
    this.authService.clearFirstLoginFlag();
    this.isVisible = false;
  }
}
