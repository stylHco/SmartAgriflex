import {AbstractControl, FormArray, FormGroup} from "@angular/forms";
import {skip} from "rxjs";
import {SubscriptionsCounter} from "../utils/subscriptions-counter";

/**
 * Automatically disables a form while it is being submitted (to prevent user from
 * changing values, especially via keyboard input, e.g. tabbing to the controls).
 *
 * Although simultaneous submissions are technically supported,
 * it's not an intended use case.
 *
 * If you need to manually disable/enable the form, pipe NEVER through the monitor
 * and manually subscribe/unsubscribe as needed.
 */
export class SubmittableFormDisabler {
  public readonly monitor = new SubscriptionsCounter();

  constructor(
    public readonly form: AbstractControl,
  ) {
    // No need to unsubscribe here - subscription is entirely within this object
    this.monitor.isSubscribed$
      .pipe(
        skip(1), // Don't care about the initial false
      )
      .subscribe(isSubmitting => {
        if (isSubmitting) {
          this.controlsToReDisable = this.getDisabledControls();
          this.form.disable();
        } else {
          this.form.enable();

          for (const control of this.controlsToReDisable) {
            control.disable();
          }

          this.controlsToReDisable = [];
        }
      });
  }

  private controlsToReDisable: AbstractControl[] = [];

  private getDisabledControls() {
    return collectAllControls(this.form)
      .filter(control => control.disabled);
  }
}

function collectAllControls(control: AbstractControl): AbstractControl[] {
  const selfArr = [control];

  if (control instanceof FormGroup) {
    return Object.values(control.controls)
      .flatMap(control => collectAllControls(control))
      .concat(selfArr);
  }

  if (control instanceof FormArray) {
    return control.controls
      .flatMap(control => collectAllControls(control))
      .concat(selfArr);
  }

  return selfArr;
}
// TODO: Should there be an option to disable this?

