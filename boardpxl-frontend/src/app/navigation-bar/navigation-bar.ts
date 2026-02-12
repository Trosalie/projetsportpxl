import { Component, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
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
  @Output() isOpenChange = new EventEmitter<boolean>();
  pages: NavPage[] = [];
  legalLinks: LegalLink[] = [];
  private destroy$ = new Subject<void>();

  constructor(private authService: AuthService, private router: Router, private roleService: RoleService) {
  }

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
      },
      // {
      //   label: "A propos de nous",
      //   url: "/about-us"
      // }
    ];
  }

  updateNavigation() {
    const currentUrl = this.router.url;
    const currentUrlWithoutParams = currentUrl.split('?')[0];

    // Route par défaut
    this.pages = [];

    if (this.roleService.getRole() === 'photographer') {
      this.pages.push({
        label: 'Tableau de bord',
        route: '/',
        icon: 'assets/images/liste_icon.svg'
      }, {
        label: 'Historique des emails',
        route: '/mails',
        icon: 'assets/images/mail_icon.svg'
      });
    }

    // Si on est sur la page de liste des photographes
    if (this.roleService.getRole() === 'admin') {

      this.pages.push({
        label: 'Liste des photographes',
        route: '/photographers',
        icon: 'assets/images/liste_icon.svg'
      }, {
        label: 'Graphique général',
        route: '/general-graph',
        icon: 'assets/images/graphic_icon.svg'
      }, {
        label: 'Logs',
        route: '/logs',
        icon: 'assets/images/logs_icon.svg'
      }, {
        label: 'Formulaire de versement',
        route: '/form/payout',
        icon: 'assets/images/form_icon.svg'
      }, {
        label: 'Formulaire d\'ajout de crédits',
        route: '/form/credits',
        icon: 'assets/images/form_icon.svg'
      }, {
        label: 'Création d\'un photographe',
        route: '/new/photographer',
        icon: 'assets/images/new_photographer_icon.svg'
      }, {
        label: 'Nouveau relevé d\'encaissement',
        route: '/settlement-report',
        icon: 'assets/images/form_icon.svg'
      }, {
        label: 'Liste des relevés',
        route: '/settlement-reports',
        icon: 'assets/images/liste_icon.svg'
      }, {
        label: 'Formulaire d\'abonnement',
        route: '/form/subscription',
        icon: 'assets/images/form_icon.svg'
      });

      // Si on est sur la page profil ou factures d'un photographe
      const invoiceMatch = currentUrl.match(/\/photographer\/(\d+)\/invoices/);
      const editMatch = currentUrl.match(/\/photographer\/(\d+)\/edit/);
      const profileMatch = currentUrl.match(/\/photographer\/(\d+)/);
      const photographerId = invoiceMatch?.[1] ?? editMatch?.[1] ?? profileMatch?.[1] ?? null;

      if (photographerId) {
        const photographerName = new URLSearchParams(window.location.search).get('name') || 'Photographe';
        const profileRoute = `/photographer/${photographerId}`;
        const invoicesRoute = `/photographer/${photographerId}/invoices`;
        const editRoute = `/photographer/${photographerId}/edit`;
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
            },
            {
              label: 'Modifier',
              route: editRoute,
              icon: 'assets/images/edit_photographer_icon.svg',
              queryParams
            }
          ]
        });
      }
    }
  }

  onNavbarToggled() {
    this.isOpen = !this.isOpen;
    this.isOpenChange.emit(this.isOpen);
  }

  closeNav() {
    this.isOpen = false;
    this.isOpenChange.emit(this.isOpen);
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
    const normalizedRoute = route.startsWith('/') ? route : '/' + route;

    // Si c'est la route racine
    if (normalizedRoute === '/') {
      return currentUrl === '/' || currentUrl === '';
    }

    // Vérifier si c'est une correspondance exacte
    if (currentUrl === normalizedRoute) {
      return true;
    }

    // Pour /photographers, vérifier que l'URL est exactement /photographers (pas de sous-routes)
    if (normalizedRoute === '/photographers') {
      return currentUrl === '/photographers';
    }

    // Pour les autres routes avec sous-chemins, vérifier correspondance exacte
    return currentUrl === normalizedRoute;
  }
}
