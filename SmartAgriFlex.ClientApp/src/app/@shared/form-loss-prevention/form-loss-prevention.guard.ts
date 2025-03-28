import {Injectable} from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import {FormLossPreventionService} from "./form-loss-prevention.service";

@Injectable({
  providedIn: 'root'
})
export class FormLossPreventionGuard  {
  constructor(
    private readonly lossPreventionService: FormLossPreventionService,
  ) {
  }

  canDeactivate(
    component: unknown,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot
  ): boolean | Promise<boolean> {
    if (!currentRoute.routeConfig) {
      console.error('FormLossPreventionGuard cannot function without routeConfig. Skipping...');
      return true;
    }

    return this.lossPreventionService.maybePromptForConfirm(currentRoute.routeConfig);
  }
}
