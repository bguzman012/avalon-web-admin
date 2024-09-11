import {CanActivate, CanActivateFn, Router} from '@angular/router';
import {Injectable} from "@angular/core";
import {AuthService} from "./services/auth-service";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean | Observable<boolean> {
    const AUTENTICADO_2FA = this.authService.getAutenticadoDosFA();
    if (AUTENTICADO_2FA != "AUTENTICADO_2FA") {
      this.router.navigate(['/login']);
      return false
    }

    return true;
  }
}
