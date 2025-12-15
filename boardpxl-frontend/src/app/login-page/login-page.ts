import { Component } from '@angular/core';
import { AuthService } from '../services/auth-service';
import { Router } from '@angular/router';
import { RoleService } from '../services/role.service';
import { environment } from '../../environments/environment.development';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-login-page',
  standalone: false,
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})

export class LoginPage
{
  email = "";
  password = "";

  constructor(private auth: AuthService, private router: Router, private role: RoleService) { }

  onSubmit()
  {
    this.auth.login(this.email, this.password).pipe(
      switchMap((response) => this.auth.saveToken(response.token))
    ).subscribe(
    {
      next: (user) =>
      {
        console.log('Utilisateur connecté :', user);

        if (environment.adminEmail.includes(user.email))
        {
          this.role.setRole("admin");
          this.router.navigate(['/']);
        }
        else
        {
          this.role.setRole("photographer");
          this.router.navigate(['/']);
        }
      },

      error: (err) =>
      {
        console.error('Erreur de login', err);
        alert("Email ou mot de passe incorrect");
      }
    });
  }
}
