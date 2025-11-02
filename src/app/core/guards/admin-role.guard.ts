import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AzlAuthenticationService } from '../services/azl-authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AdminRoleGuard implements CanActivate {
  constructor(private _auth: AzlAuthenticationService, private _router: Router) {}

  canActivate(): boolean {
    const user = this._auth.getCurrentUser();
    if (user && user.role === 'super_admin') {
      return true;
    }

    this._router.navigate(['/']);
    return false;
  }
}