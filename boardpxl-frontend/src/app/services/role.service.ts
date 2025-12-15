import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  role = signal<'photograph' | 'admin' | 'none'>("none"); // to put to none later

  setRole(role: 'photograph' | 'admin' | 'none') {
    this.role.set(role);
  }

  getRole() {
    return this.role();
  }
}