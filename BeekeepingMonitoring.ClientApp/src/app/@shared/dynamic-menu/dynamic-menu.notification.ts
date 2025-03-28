import {defer, map, merge, Observable, repeat, Subject, take} from "rxjs";
import {MenuItem} from "primeng/api";
import {getAllMenuItems} from "./dynamic-menu.utils";

const MenuUpdatedNotification: unique symbol = Symbol();

declare module 'primeng/api' {
  interface MenuItem {
    /**
     * Emit **after** the item has been changed.
     *
     * Performance note for changing {@link MenuItem.items}: first prepare the new children, then
     * update the array and only after that emit the notification. This will cause the consumers
     * to do the least work.
     */
    [MenuUpdatedNotification]?: Subject<void>;
  }
}

/**
 * Gets (or creates if does not exist yet) the subject for the menu item.
 */
export function getMenuUpdatedNotification(item: MenuItem): NonNullable<MenuItem[typeof MenuUpdatedNotification]> {
  if (!item[MenuUpdatedNotification]) {
    item[MenuUpdatedNotification] = new Subject();
  }

  return item[MenuUpdatedNotification];
}

/**
 * Traverses the menu item hierarchy and combines the update notifications into a
 * single observable. This is protected against circular graphs but handles the graph
 * structure only as it was when this function was called. As such, consumers are
 * encouraged to re-call this once the notification(s) is handled.
 *
 * Important: consumers should expect that this is emitted multiple times in succession
 * synchronously. Any individual emit may or may not be the final one in the "series".
 */
export function combineMenuUpdateNotifications(...items: MenuItem[]): Observable<MenuItem> {
  const sources: Observable<MenuItem>[] = [...getAllMenuItems(...items)]
    .map(item => {
      return getMenuUpdatedNotification(item)
        .pipe(
          map(() => item),
        );
    });

  return merge(...sources);
}

/**
 * Same as {@link combineMenuUpdateNotifications} but rebuilds the combined observable after each
 * notification, thus accounting for hierarchy structure changes.
 */
export function combineMenuUpdateNotificationsRefreshing(...items: MenuItem[]): Observable<MenuItem> {
  return defer(() => combineMenuUpdateNotifications(...items))
    .pipe(
      take(1),
      repeat(),
    );
}

