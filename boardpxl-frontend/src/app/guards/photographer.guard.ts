import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RoleService } from '../services/role.service';
import { AuthService } from '../services/auth-service';

export const photographerGuard: CanActivateFn = () => {
  const roleService = inject(RoleService);
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.getToken()) {
    router.navigate(['/login']);
    return false;
  }

  if (roleService.getRole() !== 'photographer') {
    router.navigate(['/']);
    return false;
  }

  return true;
};
