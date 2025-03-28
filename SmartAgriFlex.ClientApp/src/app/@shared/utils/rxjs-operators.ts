import {concat, defer, fromEvent, map, MonoTypeOperatorFunction, Observable, of} from "rxjs";

/**
 * Like `finalize()` operator, but for start of a subscription
 * @param callback Function to be called when source is being subscribed to
 */
export function onSubscribe<T>(callback: () => void): MonoTypeOperatorFunction<T> {
  return function (source: Observable<T>): Observable<T> {
    return defer(() => {
      callback();

      return source;
    });
  }
}

/**
 * Like `startWith` operator, but the prepended value is generated at the subscription time.
 */
export function startWithDefer<T>(valueFactory: () => T): MonoTypeOperatorFunction<T> {
  return function (source: Observable<T>): Observable<T> {
    return defer(() => {
      return concat(
        of(valueFactory()),
        source,
      );
    });
  }
}

// Based on https://notiz.dev/blog/media-observable
export function mediaMatches$(window: Window, query: string): Observable<boolean> {
  const mediaQuery = window.matchMedia(query);

  return fromEvent<MediaQueryList>(mediaQuery, 'change')
    .pipe(
      map((list: MediaQueryList) => list.matches),
      startWithDefer(() => mediaQuery.matches),
    );
}
