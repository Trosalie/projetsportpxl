import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  role = signal<'photographer' | 'admin' >("admin");

  setRole(role: 'photographer' | 'admin') {
    this.role.set(role);
  }

  getRole() {
    return this.role();
  }
}
