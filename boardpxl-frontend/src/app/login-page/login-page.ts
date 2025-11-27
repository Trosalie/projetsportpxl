import { Component } from '@angular/core';
import { AuthService } from '../services/auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  standalone: false,
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export class LoginPage {
  email = "";
  password = "";

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    this.auth.login(this.email, this.password).subscribe({
      next: (response) => {
        console.log('Login OK', response);

        this.auth.saveToken(response.token);

        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Erreur de login', err);
        alert("Email ou mot de passe incorrect");
      }
    });
  }
}
