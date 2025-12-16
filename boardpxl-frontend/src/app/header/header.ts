import { Router } from '@angular/router';
import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  userName: string = 'Test User';

  constructor(private router: Router) {}

  isLoginPage(): boolean {
    return this.router.url === '/login';
  }
  @Output() navBarToggled = new EventEmitter<void>();

  toggleNavBar() {
    this.navBarToggled.emit();
  }

}
