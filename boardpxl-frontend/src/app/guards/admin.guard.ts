import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { RoleService } from '../services/role.service';

export const adminGuard: CanMatchFn = () => {
  const roleService = inject(RoleService);
  return roleService.getRole() === 'admin';
};
