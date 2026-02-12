import { Injectable } from '@angular/core';

interface LoginAttemptData {
  attempts: number;
  blockedUntil: number | null;
  blockDuration: number;
}

@Injectable({
  providedIn: 'root'
})
export class LoginRateLimitService {
  private readonly STORAGE_KEY = 'login_rate_limit';

  constructor() {}

  /**
   * Vérifie si l'utilisateur est actuellement bloqué
   * @returns true si bloqué, false sinon
   */
  isBlocked(): boolean {
    const data = this.getStoredData();
    if (data.blockedUntil) {
      const now = Date.now();
      if (now < data.blockedUntil) {
        return true;
      } else {
        // Le blocage est expiré, on réinitialise
        this.clearBlock();
        return false;
      }
    }
    return false;
  }

  /**
   * Retourne le temps restant de blocage en secondes
   * @returns nombre de secondes restantes, ou 0 si pas bloqué
   */
  getRemainingBlockTime(): number {
    const data = this.getStoredData();
    if (data.blockedUntil) {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((data.blockedUntil - now) / 1000));
      return remaining;
    }
    return 0;
  }

  /**
   * Enregistre un blocage reçu du serveur
   * @param blockedUntil timestamp Unix en secondes
   * @param attempts nombre total de tentatives
   * @param blockDuration durée du blocage en minutes
   */
  setBlock(blockedUntil: number, attempts: number, blockDuration: number): void {
    const data: LoginAttemptData = {
      attempts: attempts,
      blockedUntil: blockedUntil * 1000, // Convertir en millisecondes
      blockDuration: blockDuration
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  /**
   * Efface le blocage et réinitialise les tentatives
   */
  clearBlock(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Met à jour le nombre de tentatives
   * @param attempts nombre de tentatives
   */
  updateAttempts(attempts: number): void {
    const data = this.getStoredData();
    data.attempts = attempts;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  /**
   * Récupère les données stockées
   */
  getStoredData(): LoginAttemptData {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      attempts: 0,
      blockedUntil: null,
      blockDuration: 0
    };
  }

  /**
   * Formatte le temps restant en format lisible
   * @returns chaîne formatée (ex: "1:30" pour 1 minute 30 secondes)
   */
  getFormattedRemainingTime(): string {
    const seconds = this.getRemainingBlockTime();
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}
