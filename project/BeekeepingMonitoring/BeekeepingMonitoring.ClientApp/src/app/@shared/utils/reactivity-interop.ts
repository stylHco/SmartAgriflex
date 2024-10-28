import {isObservable, Observable, of} from "rxjs";
import {Changeable, isChangeable} from "./changeable";
import {Pipe} from "@angular/core";

export type MaybeReactive<T> = T | Observable<T> | Changeable<T>;

@Pipe({
  name: 'appCoerce$',
  standalone: true,
})
export class CoerceObservablePipe {
  public transform<T>(input: MaybeReactive<T>): Observable<T> {
    if (isObservable(input)) {
      return input;
    }

    if (isChangeable(input)) {
      return input.value$;
    }

    return of(input);
  }
}
