import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RoleService } from '../services/role.service';
import { AuthService } from '../services/auth-service';

export const loginGuard: CanActivateFn = async (route, state) => {
  const roleService = inject(RoleService);
  const authService = inject(AuthService);
  const router = inject(Router);

  // If user is already logged in, redirect to appropriate page
  if (authService.getToken()) {
    const role = roleService.getRole();
    if (role === 'admin') {
      await router.navigate(['/photographers']);
    } else if (role === 'photographer') {
      await router.navigate(['/']);
    } else {
      // If token exists but no valid role, allow login page
      return true;
    }
    return false;
  }

  // User is not logged in, allow access to login page
  return true;
};
