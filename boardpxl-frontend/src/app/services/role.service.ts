import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  role = signal<'photographer' | 'admin' | 'none'>("none"); // to put to none later

  setRole(role: 'photographer' | 'admin' | 'none') {
    this.role.set(role);
  }

  getRole() {
    return this.role();
  }
}