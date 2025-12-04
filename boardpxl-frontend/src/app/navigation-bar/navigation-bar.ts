import { Component, Input } from '@angular/core';

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

  ngOnInit() {
    this.pages = [
      {
        label: 'Tableau de bord',
        route: '/',
        icon: 'assets/images/liste_icon.svg'
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

}
