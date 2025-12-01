import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  role = signal<'photograph' | 'admin'>("admin");

  setRole(role: 'photograph' | 'admin') {
    this.role.set(role);
  }

  getRole() {
    return this.role();
  }
}
