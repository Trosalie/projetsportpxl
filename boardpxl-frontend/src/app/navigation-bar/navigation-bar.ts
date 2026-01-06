import { Component, Input } from '@angular/core';
import { AuthService } from '../services/auth-service';
import { Router } from '@angular/router';
import { RoleService } from '../services/role.service';

interface NavPage {
  label: string;
  route: string;
  icon: string;
}

interface LegalLink {
  label: string;
  url: string;
}

@Component({
  selector: 'app-navigation-bar',
  standalone: false,
  templateUrl: './navigation-bar.html',
  styleUrl: './navigation-bar.scss',
})
export class NavigationBar {
  @Input() isOpen: boolean = false;
  pages: NavPage[] = [];
  legalLinks: LegalLink[] = [];

  constructor(private authService: AuthService, private router: Router, private roleService: RoleService) {}

  ngOnInit() {
    const role = this.roleService.getRole();
    const dashboardRoute = role === 'admin' ? '/photographers' : '/';

    this.pages = [
      {
        label: 'Tableau de bord',
        route: dashboardRoute,
        icon: 'assets/images/liste_icon.svg'
      },
      {
        label: 'Historique des emails',
        route: '/mails',
        icon: 'assets/images/mail_icon.svg'
      },
      // {
      //   label: 'Graphique général',
      //   route: '/general-graph',
      //   icon: 'assets/images/graphic_icon.svg'
      // }
    ];

    this.legalLinks = [
      {
        label: 'Mentions légales',
        url: 'https://www.app.sportpxl.com/legal'
      },
      {
        label: "Conditions générales d'utilisation",
        url: 'https://www.app.sportpxl.com/terms-conditions'
      },
      {
        label: 'Politique de confidentialité',
        url: 'https://sportpxl.com/politique-de-confidentialite/'
      }
    ];
  }

  onNavbarToggled() {
    this.isOpen = !this.isOpen;
  }

  disconnect() {
    this.isOpen = false;
    this.roleService.clearRole();
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  isLoginPage(): boolean {
    return this.router.url === '/login';
  }

  isActive(route: string): boolean {
    return this.router.url === route || this.router.url.startsWith(route + '/');
  }
}
