import { Component, Input, OnDestroy } from '@angular/core';
import { AuthService } from '../services/auth-service';
import { Router, NavigationEnd } from '@angular/router';
import { RoleService } from '../services/role.service';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

interface NavPage {
  label: string;
  route: string;
  icon: string;
  subPages?: NavPage[];
  queryParams?: Record<string, string>;
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
export class NavigationBar implements OnDestroy {
  @Input() isOpen: boolean = false;
  pages: NavPage[] = [];
  legalLinks: LegalLink[] = [];
  private destroy$ = new Subject<void>();

  constructor(private authService: AuthService, private router: Router, private roleService: RoleService) {}

  ngOnInit() {
    this.updateNavigation();
    
    // Écouter les changements de route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.updateNavigation();
    });

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

  updateNavigation() {
    const currentUrl = this.router.url;
    const currentUrlWithoutParams = currentUrl.split('?')[0];
    
    // Route par défaut
    this.pages = [
      {
        label: 'Tableau de bord',
        route: '/',
        icon: 'assets/images/liste_icon.svg'
      }
    ];
    
    if (this.roleService.getRole() === 'photographer') {
      this.pages.push({
        label: 'Historique des emails',
        route: '/mails',
        icon: 'assets/images/mail_icon.svg'
      });
    }

    // Si on est sur la page de liste des photographes
    if (this.roleService.getRole() === 'admin') {
      this.pages = [
        {
          label: 'Liste des photographes',
          route: '/photographers',
          icon: 'assets/images/liste_icon.svg'
        },
        {
        label: 'Graphique général',
        route: '/general-graph',
        icon: 'assets/images/graphic_icon.svg'
      }
    ];
          label: 'Logs',
          route: '/logs',
          icon: 'assets/images/logs_icon.svg'
        }
      ];

      // Si on est sur la page profil ou factures d'un photographe
      const invoiceMatch = currentUrl.match(/\/photographer\/(\d+)\/invoices/);
      const profileMatch = currentUrl.match(/\/photographer\/(\d+)/);
      const photographerId = invoiceMatch?.[1] ?? profileMatch?.[1] ?? null;

      if (photographerId) {
        const photographerName = new URLSearchParams(window.location.search).get('name') || 'Photographe';
        const profileRoute = `/photographer/${photographerId}`;
        const invoicesRoute = `/photographer/${photographerId}/invoices`;
        const queryParams = photographerName ? { name: photographerName } : undefined;

        this.pages.push({
          label: photographerName,
          route: '',
          icon: 'assets/images/photographer_icon.svg',
          subPages: [
            {
              label: 'Profil',
              route: profileRoute,
              icon: 'assets/images/profile_info_icon.svg',
              queryParams
            },
            {
              label: 'Historique des factures',
              route: invoicesRoute,
              icon: 'assets/images/histofacture_icon.svg',
              queryParams
            }
          ]
        });
      }
    }
  }

  onNavbarToggled() {
    this.isOpen = !this.isOpen;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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

  isActivePage(route: string): boolean {
    const currentUrl = this.router.url.split('?')[0]; // Enlever les query params
    
    // Si c'est la route racine
    if (route === '/') {
      return currentUrl === '/' || currentUrl === '';
    }
    
    // Vérifier si c'est une correspondance exacte
    if (currentUrl === route) {
      return true;
    }
    
    // Pour /photographers, vérifier que l'URL est exactement /photographers (pas de sous-routes)
    if (route === '/photographers') {
      return currentUrl === '/photographers';
    }
    
    // Pour les autres routes avec sous-chemins, vérifier correspondance exacte
    return currentUrl === route;
  }
}
