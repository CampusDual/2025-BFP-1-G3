import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../services/login.service';

export const noAuthGuard: CanActivateFn = () => {
  const userService = inject(LoginService);
  const router = inject(Router);

  if (!userService.isAuthenticated()) {
    return true;
  } else {
    return router.createUrlTree(['/main/ofertas']); 
  }
};