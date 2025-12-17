import { Component } from '@angular/core';
import { AuthService } from '../services/auth-service';
import { Router } from '@angular/router';
import { RoleService } from '../services/role.service';
import { environment } from '../../environments/environment.development';

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
  isLoading = false;

  constructor(private auth: AuthService, private router: Router, private role: RoleService) { }

  onSubmit()
  {
    this.isLoading = true;
    this.auth.login(this.email, this.password).subscribe(
    {
      next: (response) =>
      {
        this.auth.saveToken(response.token, response.user);
        
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
        alert("Email ou mot de passe incorrect");
        this.isLoading = false;
      }
    });
  }
}
