import { Router } from '@angular/router';
import { Component, EventEmitter, Output } from '@angular/core';
import { AuthService } from '../services/auth-service';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  userName: string = '';

  constructor(private router: Router, private authService: AuthService) {}

  isLoginPage(): boolean {
    return this.router.url === '/login';
  }
  @Output() navBarToggled = new EventEmitter<void>();

  toggleNavBar() {
    this.navBarToggled.emit();
  }

  ngOnInit() {
    this.userName = this.authService.getUser()!.name;
  }

}
