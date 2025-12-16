import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  role = signal<'photographer' | 'admin' | 'none'>('none');

  constructor() {
    // Load role from localStorage on init
    const savedRole = localStorage.getItem('user_role');
    if (savedRole === 'photographer' || savedRole === 'admin') {
      this.role.set(savedRole);
    }
  }

  setRole(role: 'photographer' | 'admin' | 'none') {
    this.role.set(role);
    if (role === 'none') {
      localStorage.removeItem('user_role');
    } else {
      localStorage.setItem('user_role', role);
    }
  }

  getRole() {
    return this.role();
  }

  clearRole() {
    this.setRole('none');
  }
}
