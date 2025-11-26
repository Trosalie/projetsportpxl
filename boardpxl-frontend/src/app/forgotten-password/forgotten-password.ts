import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

@Component({
  selector: 'app-forgotten-password',
  standalone: false,
  templateUrl: './forgotten-password.html',
  styleUrl: './forgotten-password.scss',
})
export class ForgottenPassword {
  email = "";

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    this.auth.login(this.email).subscribe({
      next: (response) => {
        console.log('Login OK', response);

        this.auth.saveToken(response.token);

        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Erreur de login', err);
        alert("Email ou mot de passe incorrect");
      }
    });
  }
}
