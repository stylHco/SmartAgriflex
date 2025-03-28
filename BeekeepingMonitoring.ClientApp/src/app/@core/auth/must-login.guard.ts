import {Injectable} from "@angular/core";
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import {Observable, of} from "rxjs";
import {catchError, concatMap, map, timeout} from "rxjs/operators";
import {AuthService} from "./auth.service";

@Injectable({
  providedIn: 'root'
})
export class MustLoginGuard  {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot)
    : Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.authService.getStatus()
      .pipe(
        concatMap(status => {
          if (status.isLoggedIn) return of(true);

          // Don't redirect for no reason, refresh first
          return this.authService.getStatusForceLatest()
            .pipe(
              timeout(3000),
              map(status => {
                if (status.isLoggedIn) return true;

                return this.makeRedirectDestination(state);
              }),
              catchError(err => {
                return of(this.makeRedirectDestination(state));
              }),
            )
        }),
      );
  }

  private makeRedirectDestination(state: RouterStateSnapshot): UrlTree {
    return this.router.createUrlTree(['/auth/login'], {
      queryParams: {
        ['returnUrl']: state.url
      }
    });
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot)
    : Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.canActivate(childRoute, state);
  }
}
