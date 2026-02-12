import { Component } from '@angular/core';

@Component({
  selector: 'app-popup',
  standalone: false,
  templateUrl: './popup.html',
  styleUrl: './popup.scss',
})
export class Popup {
  notificationVisible: boolean = false;
  notificationMessage: string = "";

  // Afficher la notification quelques secondes
  showNotification(message: string) {
    this.notificationMessage = message;
    this.notificationVisible = true;
    setTimeout(() => {
      this.notificationVisible = false;
    }, 5000); // 5 secondes
  }
}
