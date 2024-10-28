import {ChangeDetectorRef} from "@angular/core";
import {MonoTypeOperatorFunction, tap} from "rxjs";

export function autoMarkForCheck<T>(changeDetectorRef: ChangeDetectorRef): MonoTypeOperatorFunction<T> {
  const doMark = () => changeDetectorRef.markForCheck();

  return source => source
    .pipe(
      tap({
        next: doMark,
        error: doMark,
        complete: doMark,
      }),
    );
}
