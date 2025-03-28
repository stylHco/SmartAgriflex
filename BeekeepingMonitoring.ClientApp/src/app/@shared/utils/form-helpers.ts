import {AbstractControl, FormControlStatus} from "@angular/forms";
import {defer, map, Observable, startWith, Subscription} from "rxjs";
import {distinctUntilChanged} from "rxjs/operators";

export function enableControlWhileAnother<TReferenceValue>(
  managedControl: AbstractControl,
  observedControl: AbstractControl<TReferenceValue>,
  enabledSelector: (value: TReferenceValue) => boolean,
  resetWhenDisabling: boolean = true,
): Subscription {
  return observedControl.valueChanges
    .pipe(
      distinctUntilChanged(),
      map(value => enabledSelector(value)),
      distinctUntilChanged(),
    )
    .subscribe(isEnabled => {
      if (isEnabled) {
        managedControl.enable();
        return;
      }

      if (resetWhenDisabling) managedControl.reset();
      managedControl.disable();
    });
}

export function setControlEnabled(control: AbstractControl, isEnabled: boolean): void {
  if (isEnabled) control.enable();
  else control.disable();
}

/**
 * Returns a constant value if the control is disabled, otherwise calls the
 * enabledValueFactory and returns the value produced by it.
 */
export function controlDisabledOrDerive<TControl extends AbstractControl, TDisabledValue, TEnabledValue>(
  control: TControl,
  disabledValue: TDisabledValue,
  enabledValueFactory: (control: TControl) => TEnabledValue,
): TDisabledValue | TEnabledValue {
  if (control.disabled) return disabledValue;

  return enabledValueFactory(control);
}

/**
 * Creates an observable of the control's values,
 * including the current value (emitted when subscribed)
 */
export function getControlValue$<TValue>(control: AbstractControl<TValue>): Observable<TValue> {
  return defer(() => {
    return control.valueChanges
      .pipe(
        startWith(control.value),
      );
  });
}

/**
 * Creates an observable of the control's status,
 * including the current status (emitted when subscribed)
 */
export function getControlStatus$(control: AbstractControl): Observable<FormControlStatus> {
  return defer(() => {
    return control.statusChanges
      .pipe(
        startWith(control.status),
      );
  });
}
