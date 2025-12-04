import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  userName: string = 'Test User';
  @Output() navBarToggled = new EventEmitter<void>();

  toggleNavBar() {
    this.navBarToggled.emit();
  }

}
