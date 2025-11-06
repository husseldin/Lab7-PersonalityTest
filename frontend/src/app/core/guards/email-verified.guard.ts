import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const emailVerifiedGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.currentUser();

  if (user?.emailVerified) {
    return true;
  }

  alert('Please verify your email address before taking the test.');
  router.navigate(['/profile']);
  return false;
};
