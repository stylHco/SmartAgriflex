import {AbstractControl, ValidatorFn} from "@angular/forms";
import {BaseConfigFn} from "@rxweb/reactive-form-validators/models/config/base-config-fn";

export enum DateComparisonMode {
  GreaterThan,

  // TODO: rest
}

export interface DateRelativeConfig extends BaseConfigFn<DateRelativeConfig> {
  referenceValueProvider: (control: AbstractControl) => Date|null|undefined;
  comparisonMode: DateComparisonMode,
}

export function dateRelative(config: DateRelativeConfig): ValidatorFn {
  return (control: AbstractControl) => {
    const referenceValue = config.referenceValueProvider(control);
    const value: Date|null|undefined = control.value;

    let isValid;

    if (!value || !referenceValue) isValid = true;
    else {
      switch (config.comparisonMode) {
        case DateComparisonMode.GreaterThan:
          isValid = value > referenceValue;
          break;
      }
    }

    if (!isValid) {
      return {
        dateRelative: {
          message: config.message,
        }
      }
    }

    return null;
  }
}
