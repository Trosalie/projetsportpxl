import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RoleService } from '../services/role.service';
import { AuthService } from '../services/auth-service';

export const photographerGuard: CanActivateFn = async (route, state) => {
  const roleService = inject(RoleService);
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.getToken()) {
    // Clear any stale role data
    roleService.clearRole();
    await router.navigate(['/login']);
    return false;
  }

  const role = roleService.getRole();
  if (role !== 'photographer') {
    if (role === 'admin') {
      await router.navigate(['/photographers']);
    } else {
      // If no valid role, redirect to login
      roleService.clearRole();
      await router.navigate(['/login']);
    }
    return false;
  }

  return true;
};
