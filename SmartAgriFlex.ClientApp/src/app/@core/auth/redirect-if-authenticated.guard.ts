import {Injectable} from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import {Observable} from 'rxjs';
import {AuthService} from "./auth.service";
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class RedirectIfAuthenticatedGuard  {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return this.authService.getStatus()
      .pipe(
        map(authStatus => {
          if (!authStatus.isLoggedIn) return true;

          return this.router.parseUrl('/');
        }),
      );
  }

  canActivateChild(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return this.canActivate(next, state);
  }
}
