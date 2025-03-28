import {BehaviorSubject, isObservable, map, Observable, of, startWith, Subject, takeUntil} from "rxjs";
import {distinctUntilChanged} from "rxjs/operators";
import {ChangeDetectorRef, inject, Pipe} from "@angular/core";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {autoMarkForCheck} from "./change-detection-helpers";

/**
 * A read-only view of a value that has both current state/value and an
 * a stream of updates
 */
export interface Changeable<T> {
  /**
   * The current value.
   */
  readonly value: T;

  /**
   * An observable of changes of the value.
   * The current will be emitted when subscribing.
   */
  readonly value$: Observable<T>;
}

export function isChangeable(input: unknown, verifyObservable: boolean = true): input is Changeable<unknown> {
  if (!input) return false;
  if (typeof input !== 'object') return false;

  if (!('value' in input)) return false;
  if (!('value$' in input)) return false;

  if (verifyObservable) {
    try {
      if (!isObservable(input.value$)) return false
    } catch (e) {
      console.warn('isChangeable() failed while verifying the observable: ', e);
      return false;
    }
  }

  return true;
}

export function changeableFromConstValue<T>(value: T): Changeable<T> {
  return {
    value: value,
    value$: of(value),
  };
}

export function changeableFromBehaviourSubject<T>(subject: BehaviorSubject<T>): Changeable<T> {
  return {
    get value(): T {
      return subject.value;
    },

    value$: subject.asObservable(),
  };
}

/**
 * Creates a changeable from an observable that emits the values and a
 * provider delegate for fetching teh value synchronously.
 *
 * The caller is responsible for ensuring that both sources are synchronized.
 *
 * @param value$
 * @param valueProvider
 */
export function changeableFromPair<T>(value$: Observable<T>, valueProvider: () => T): Changeable<T> {
  return {
    get value(): T {
      return valueProvider();
    },

    value$: value$,
  };
}

type ChangeableFromTriggerOptionsFull = {
  /**
   * If true, will not add an additional emit when subscribing.
   * Use only if there is no need for it (e.g. originates from a BehaviorSubject).
   */
  skipInitialEmit: boolean;
  distinctUntilChanged: boolean;
};

type ChangeableFromTriggerOptions = Partial<ChangeableFromTriggerOptionsFull>;

const changeableFromTriggerOptionsDefaults: ChangeableFromTriggerOptionsFull = {
  skipInitialEmit: true,
  distinctUntilChanged: true,
};

/**
 * Creates a changeable from an observable that emits whenever the value was changed.
 * A shared provider delegate is used to create the value for both fetch the value
 * for both synchronous access and for observable output.
 *
 * @param trigger
 * @param valueProvider Called whenever the value is retrieved
 * @param options
 */
export function changeableFromTrigger<T>(
  trigger: Observable<void>,
  valueProvider: () => T,
  options?: ChangeableFromTriggerOptions,
): Changeable<T> {
  const mergedOptions: ChangeableFromTriggerOptionsFull = {
    ...changeableFromTriggerOptionsDefaults,
    ...options,
  };

  if (!mergedOptions.skipInitialEmit) {
    trigger = trigger
      .pipe(
        startWith(undefined),
      );
  }

  let value$ = trigger
    .pipe(
      map(() => valueProvider()),
    );

  if (mergedOptions.distinctUntilChanged) {
    value$ = value$
      .pipe(
        distinctUntilChanged(),
      );
  }

  return {
    get value(): T {
      return valueProvider();
    },

    value$: value$,
  };
}

@UntilDestroy()
@Pipe({
  name: 'changeableValue',
  standalone: true,
  pure: false,
})
export class ChangeableValuePipe<T> {
  private readonly cd = inject(ChangeDetectorRef);

  private readonly preSwitchChangeable = new Subject<void>();

  private _currentChangeable?: Changeable<T>;

  transform(changeable: Changeable<T>): T;
  transform(changeable: Changeable<T> | undefined): T | undefined;
  transform(changeable: Changeable<T> | undefined): T | undefined {
    if (changeable !== this._currentChangeable) {
      this.preSwitchChangeable.next();
      this._currentChangeable = changeable;

      if (changeable) {
        changeable.value$
          .pipe(
            takeUntil(this.preSwitchChangeable),
            untilDestroyed(this),
            autoMarkForCheck(this.cd),
          )
          .subscribe();
      }
    }

    return changeable?.value;
  }
}
