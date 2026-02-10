import { Component, signal } from '@angular/core';

/**
 * @class App
 * @brief Composant racine de l'application Angular
 * 
 * Composant principal de l'application BoardPxl Frontend.
 * Configure le sélecteur racine et les templates de base.
 * 
 * @author SportPxl Team
 * @version 1.0.0
 * @date 2026-01-13
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.scss'
})

export class App {
  /**
   * @var title Signal contenant le titre de l'application
   */
  protected readonly title = signal('boardpxl-frontend');
}
