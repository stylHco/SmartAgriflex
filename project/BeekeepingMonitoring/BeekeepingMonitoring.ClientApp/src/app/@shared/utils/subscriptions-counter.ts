import {BehaviorSubject, finalize, map, MonoTypeOperatorFunction, Observable, tap} from "rxjs";
import {distinctUntilChanged} from "rxjs/operators";
import {onSubscribe} from "./rxjs-operators";

type MonitorOptions = {
  /**
   * If true, will ignore successful completions and manual unsubscribing and still
   * report the observable as subscribed, unless it ended with an error.
   *
   * Example use case: some functionality is disabled while the observable is in-flight
   * and should **not** be re-enabled on successful completion as the functionality
   * will become unavailable (e.g. user is redirected to a different route). However,
   * should an error occur, the functionality is re-enabled to give the user a chance
   * to correct any mistakes or to simply try again.
   */
  decrementOnlyOnError: boolean;
};

export class SubscriptionsCounter {
  private readonly subscriptionsCountSubject = new BehaviorSubject(0);

  public readonly subscriptionsCount$ = this.subscriptionsCountSubject.asObservable();

  public readonly isSubscribed$ = this.subscriptionsCountSubject
    .pipe(
      map(count => count > 0),
      distinctUntilChanged(),
    );

  public get isSubscribed(): boolean {
    return this.subscriptionsCountSubject.value > 0;
  }

  /**
   * Returns an Observable that mirrors the source Observable, but will also report the subscription
   * status to `subscriptionsCount`/`isSubscribed`
   */
  public monitor<T>(options?: MonitorOptions): MonoTypeOperatorFunction<T> {
    const decrementOnlyOnError = options?.decrementOnlyOnError ?? false;
    const that = this;

    return function (source: Observable<T>): Observable<T> {
      let observable = source
        .pipe(
          onSubscribe(() => that.updateInFlight(+1)),
        );

      if (decrementOnlyOnError) {
        observable = observable
          .pipe(
            tap({
              error: () => that.updateInFlight(-1),
            }),
          );
      } else {
        observable = observable
          .pipe(
            finalize(() => that.updateInFlight(-1)),
          );
      }

      return observable;
    }
  }

  // Must not throw! (to avoid breaking the monitored observable)
  private updateInFlight(delta: number): void {
    try {
      let newValue = this.subscriptionsCountSubject.value + delta;

      // Do not permit the in-flight counter to go below 0
      if (newValue < 0) {
        newValue = 0;
        console.warn('SubscriptionsCounter - in-flight count went below 0, this is unsupported.', this);
      }

      this.subscriptionsCountSubject.next(newValue);
    } catch (e) {
      console.warn(
        'Error while updating the in-flight counter. SubscriptionsCounter is now likely in an invalid state.',
        e
      );
    }
  }
}
