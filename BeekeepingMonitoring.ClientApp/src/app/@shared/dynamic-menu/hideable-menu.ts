import {MonoTypeOperatorFunction, Observable, Subject, takeUntil} from "rxjs";
import {MenuItem} from "primeng/api";
import {getAllMenuItems} from "./dynamic-menu.utils";
import {getMenuUpdatedNotification} from "./dynamic-menu.notification";

export const MenuVisibility$: unique symbol = Symbol();

const MenuVisibilityTakeUntil: unique symbol = Symbol();

declare module 'primeng/api' {
  interface MenuItem {
    [MenuVisibility$]?: Observable<boolean>;

    [MenuVisibilityTakeUntil]?: Subject<void>;
  }
}

export function getMenuVisibilityTakeUntil(menuItem: MenuItem): Subject<void> {
  if (!menuItem[MenuVisibilityTakeUntil]) {
    menuItem[MenuVisibilityTakeUntil] = new Subject<void>();
  }

  return menuItem[MenuVisibilityTakeUntil];
}

export function subscribeAllMenuVisibility(items: Readonly<MenuItem[]>, options?: MenuVisibilityOptions): void {
  for (const item of getAllMenuItems(...items)) {
    subscribeMenuVisibility(item, options);
  }
}

export function subscribeMenuVisibility(item: MenuItem, options?: MenuVisibilityOptions): void {
  const itemTakeUntil = getMenuVisibilityTakeUntil(item);

  // Kill existing subscription
  itemTakeUntil.next();

  const visibleSource$ = item[MenuVisibility$];
  if (!visibleSource$) return;

  let visible$ = visibleSource$
    .pipe(
      takeUntil(itemTakeUntil),
    );

  if (options?.takeUntil) {
    visible$ = visible$
      .pipe(
        takeUntil(options.takeUntil),
      );
  }

  if (options?.pipe) {
    visible$ = visible$.pipe(options.pipe);
  }

  visible$
    .subscribe(isVisible => {
      item.visible = isVisible;
      getMenuUpdatedNotification(item).next();
    });
}

export interface MenuVisibilityOptions {
  takeUntil?: Observable<void>;

  /**
   * If specified, this will be applied to the translation observable
   */
  pipe?: MonoTypeOperatorFunction<any>;
}
