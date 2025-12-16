import { Router, NavigationEnd } from '@angular/router';
import { Component, EventEmitter, Output, OnDestroy } from '@angular/core';
import { AuthService } from '../services/auth-service';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnDestroy {
  userName: string = '';
  private destroy$ = new Subject<void>();

  constructor(private router: Router, private authService: AuthService) {
    // Update userName on navigation (after login)
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.updateUserName();
    });

    // Clear userName on logout
    this.authService.logout$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.userName = '';
    });
  }

  isLoginPage(): boolean {
    return this.router.url === '/login';
  }
  @Output() navBarToggled = new EventEmitter<void>();

  toggleNavBar() {
    this.navBarToggled.emit();
  }

  ngOnInit() {
    this.updateUserName();
  }

  private updateUserName() {
    const user = this.authService.getUser();
    if (user) {
      this.userName = user.name;
    } else {
      this.userName = '';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
