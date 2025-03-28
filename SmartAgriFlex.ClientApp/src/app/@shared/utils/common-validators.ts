import {AbstractControl, AsyncValidatorFn, ValidatorFn} from "@angular/forms";
import {RxwebValidators} from "@rxweb/reactive-form-validators";
import {catchError, first, map, Observable, of} from "rxjs";
import {ApiException} from "../../@core/app-api";

interface MessageAware {
  message?: string;
}

type ValidatorBlueprint<TConfig> = (config?: TConfig) => ValidatorFn;

function wrapBlueprintWithMessage<TConfig>(
  innerFn: ValidatorBlueprint<TConfig|MessageAware>, message: string
): ValidatorBlueprint<TConfig> {
  const messageConfig = <MessageAware>{message: message};

  return config => {
    // Unpack messageConfig first so that if config specifies a message (?) the latter would take priority
    const newConfig = !config ? messageConfig : {
      ...messageConfig,
      ...config,
    };

    return innerFn(newConfig);
  }
}

// Some notes: this is not tree-shaking friendly - referencing `RxwebValidators`
// pulls in all validators. However the individual validator functions do not
// appear to be exported directly, so it's gonna be pretty annoying
// (impossible?) to optimize this.
// The "good" news is that this is not any worse than using
// `RxwebValidators.[...]()` directly.

export class CommonValidators {
  public static readonly required = wrapBlueprintWithMessage(
    RxwebValidators.required,
    'common_validations.required'
  );

  // TODO: parametrize the validation messages

  public static readonly minLength = wrapBlueprintWithMessage(
    RxwebValidators.minLength,
    'common_validations.minLength'
  );

  public static readonly maxLength = wrapBlueprintWithMessage(
    RxwebValidators.maxLength,
    'common_validations.maxLength'
  );

  public static readonly email = wrapBlueprintWithMessage(
    RxwebValidators.email,
    'common_validations.email'
  );

  /**
   * Gets the first emit from the provided observable.
   * * Non-error emit - valid
   * * Error emit with ApiException and 409 status - duplicate
   * * Any other error is rethrown
   */
  public static commonUniqueValidator(checkFn: (control: AbstractControl) => Observable<unknown>): AsyncValidatorFn {
    return (control: AbstractControl) => {
      return checkFn(control)
        .pipe(
          first(),
          map(() => null),
          catchError(err => {
            if (err instanceof ApiException && err.status === 409) {
              return of({
                unique: {
                  message: 'common_validations.duplicate',
                },
              });
            }

            throw err;
          }),
        );
    };
  }
}
