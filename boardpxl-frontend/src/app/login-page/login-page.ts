import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../services/auth-service';
import { Router } from '@angular/router';
import { RoleService } from '../services/role.service';
import { environment } from '../../environments/environment';
import { LoginRateLimitService } from '../services/login-rate-limit.service';

@Component({
  selector: 'app-login-page',
  standalone: false,
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})

export class LoginPage implements OnInit, OnDestroy
{
  email = "";
  password = "";
  isLoading = false;
  isBlocked = false;
  errorMessage = "";
  successMessage = "";
  remainingTime = "";
  is_first_login = false;
  private countdownInterval: any;

  constructor(
    private auth: AuthService, 
    private router: Router, 
    private role: RoleService,
    private rateLimitService: LoginRateLimitService
  ) { }

  ngOnInit(): void {
    this.checkBlockStatus();
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  checkBlockStatus(): void {
    this.isBlocked = this.rateLimitService.isBlocked();
    if (this.isBlocked) {
      this.startCountdown();
    }
  }

  startCountdown(): void {
    this.updateRemainingTime();
    this.countdownInterval = setInterval(() => {
      if (this.rateLimitService.getRemainingBlockTime() <= 0) {
        this.isBlocked = false;
        this.remainingTime = "";
        this.errorMessage = "";
        clearInterval(this.countdownInterval);
      } else {
        this.updateRemainingTime();
      }
    }, 1000);
  }

  updateRemainingTime(): void {
    this.remainingTime = this.rateLimitService.getFormattedRemainingTime();
    const data = this.rateLimitService.getStoredData();
    this.errorMessage = `Trop de tentatives échouées (${data.attempts}). Réessayez dans ${this.remainingTime}.`;
  }

  onForgotPassword(): void {
    if (this.email) {
      this.auth.sendPasswordResetEmail(this.email).subscribe({
        next: () => {
          console.log('Email de réinitialisation envoyé');
          this.successMessage = "Un email de réinitialisation a été envoyé si l'adresse existe.";
          this.errorMessage = "";
        }
      });
    } else {
      console.warn('Email non fourni pour la réinitialisation de mot de passe');
      this.errorMessage = "Veuillez entrer votre adresse email pour réinitialiser votre mot de passe.";
      this.successMessage = "";
    }
  }

  onSubmit()
  {
    // Vérifier si l'utilisateur est bloqué
    if (this.rateLimitService.isBlocked()) {
      this.isBlocked = true;
      this.updateRemainingTime();
      return;
    }

    this.isLoading = true;
    this.errorMessage = "";
    
    this.auth.login(this.email, this.password).subscribe(
    {
      next: (response) =>
      {
        // Connexion réussie, effacer le blocage
        this.rateLimitService.clearBlock();
        
        this.auth.saveToken(response.token, response.user, response.is_first_login);
        
        if (environment.adminEmail.includes(response.user.email))
        {
          this.role.setRole("admin");
          this.router.navigate(['/photographers']);
        }
        else
        {
          this.role.setRole("photographer");
          this.router.navigate(['/']);
        }
        this.isLoading = false;
      },

      error: (err) =>
      {
        console.error('Erreur de login', err);
        this.isLoading = false;

        // Gérer les erreurs de rate limiting (status 429)
        if (err.status === 429 && err.error) {
          this.isBlocked = true;
          this.rateLimitService.setBlock(
            err.error.blocked_until,
            err.error.attempts,
            err.error.block_duration
          );
          this.startCountdown();
        } 
        // Gérer les erreurs d'authentification normales (status 401)
        else if (err.status === 401 && err.error) {
          const attempts = err.error.attempts || 0;
          const remainingAttempts = err.error.remaining_attempts || 0;
          
          this.rateLimitService.updateAttempts(attempts);
          
          if (remainingAttempts > 0) {
            this.errorMessage = `Email ou mot de passe incorrect. ${remainingAttempts} tentative(s) restante(s) avant blocage.`;
          } else {
            this.errorMessage = "Email ou mot de passe incorrect.";
          }
        } 
        // Autres erreurs
        else {
          this.errorMessage = "Une erreur est survenue. Veuillez réessayer.";
        }
      }
    });
  }
}
