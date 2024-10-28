import {Injectable} from '@angular/core';
import {FormGroup} from "@angular/forms";
import {Route} from "@angular/router";
import {TranslocoService} from "@ngneat/transloco";

export interface IMonitoredForm {
  form: FormGroup;
  routeFilter: Route | null;
}

/**
 * While the system was originally designed for angular's reactive forms, other
 * methods of (temporarily) storing user input are also possible.
 *
 * As such, a new interface, "loss state provider" has been implemented.
 * Its goal is purely to check whether there is currently some unsaved
 * (aka dirty, aka pending) input by the user.
 *
 * TODO: rework the forms to also use this system (will need to update the generator).
 * TODO: allow each loss provider to display its own confirmation popup.
 */
export interface ILossStateProvider {
  anyPendingChanges: () => boolean;
  routeFilter: Route | null;
}

@Injectable({
  providedIn: 'root'
})
export class FormLossPreventionService {
  private monitoredForms: Set<IMonitoredForm> = new Set<IMonitoredForm>();
  private monitoredProviders = new Set<ILossStateProvider>();

  constructor(
    private readonly translocoService: TranslocoService,
  ) {
  }

  public registerForm(form: IMonitoredForm): boolean {
    if (this.monitoredForms.has(form)) {
      console.warn('Attempting to register same form for loss prevention twice', form);
      return false;
    }

    this.monitoredForms.add(form);
    return true;
  }

  public unregisterForm(form: IMonitoredForm): boolean {
    if (!this.monitoredForms.has(form)) {
      console.warn('Attempting to unregister form from loss prevention but it is not registered', form);
      return false;
    }

    this.monitoredForms.delete(form);
    return true;
  }

  public registerProvider(provider: ILossStateProvider): void {
    if (this.monitoredProviders.has(provider)) {
      console.warn('Attempting to register same provider for loss prevention twice', provider);
      return;
    }

    this.monitoredProviders.add(provider);
  }

  public unregisterProvider(provider: ILossStateProvider): void {
    if (!this.monitoredProviders.has(provider)) {
      console.warn('Attempting to unregister provider from loss prevention but it is not registered', provider);
      return;
    }

    this.monitoredProviders.delete(provider);
  }

  public anyPendingChanges(routeFilter?: Route | null): boolean {
    for (const monitoredForm of this.monitoredForms) {
      if (routeFilter && monitoredForm.routeFilter && monitoredForm.routeFilter !== routeFilter) {
        continue;
      }

      if (monitoredForm.form.dirty) {
        return true;
      }
    }

    for (const provider of this.monitoredProviders) {
      if (routeFilter && provider.routeFilter && provider.routeFilter !== routeFilter) {
        continue;
      }

      if (provider.anyPendingChanges()) {
        return true;
      }
    }

    return false;
  }

  public maybePromptForConfirm(routeFilter?: Route | null): Promise<boolean> {
    const isLossRisk = this.anyPendingChanges(routeFilter);

    // If there is no risk, return directly
    if (!isLossRisk) return Promise.resolve(true);

    // Else ask for user's confirmation
    return this._doPromptForConfirm();
  }

  private _doPromptForConfirm(): Promise<boolean> {
    // TODO: nice, styled dialog
    return Promise.resolve(confirm(this.translocoService.translate('form_loss_prevention.risk_confirm')));
  }
}

export function buildLossStateProvider(routeFilter: Route | null, anyPendingChanges: () => boolean): ILossStateProvider {
  return {
    anyPendingChanges: anyPendingChanges,
    routeFilter: routeFilter,
  };
}
