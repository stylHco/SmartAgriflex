import {Injectable} from "@angular/core";
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from "@angular/router";

export const IS_INTERNAl_EXTRA_KEY = '_internal';

@Injectable({
  providedIn: "root",
})
export class IsInternalNavigationResolver  {
  constructor(
    private readonly router: Router,
  ) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Note: state is only available during navigation, hence resolver
    // (it's possible to fetch it from location history afterwards,
    // but I prefer the using the router, as it is a routing concern)
    const extraState = this.router.getCurrentNavigation()?.extras.state ?? null;

    if (!extraState) return false;
    if (!extraState.hasOwnProperty(IS_INTERNAl_EXTRA_KEY)) return false;

    return !!extraState[IS_INTERNAl_EXTRA_KEY];
  }
}
