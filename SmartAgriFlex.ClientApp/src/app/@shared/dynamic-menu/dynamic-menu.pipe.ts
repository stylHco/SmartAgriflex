import {ChangeDetectorRef, inject, Pipe, PipeTransform} from '@angular/core';
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {MenuItem} from "primeng/api";
import {Subject, takeUntil} from "rxjs";
import {combineMenuUpdateNotificationsRefreshing} from "./dynamic-menu.notification";
import {autoMarkForCheck} from "../utils/change-detection-helpers";
import {removeByCondition} from "../utils/collection.helpers";
import {duplicateMenuHierarchy} from "./dynamic-menu.utils";

@UntilDestroy()
@Pipe({
  name: 'dynamicMenu',
  standalone: true,
  pure: false,
})
export class DynamicMenuPipe implements PipeTransform {
  private readonly cd = inject(ChangeDetectorRef);

  private readonly switchingItems = new Subject<void>();

  private latestItems?: Readonly<MenuItem[]>;
  private latestPreserveHidden?: boolean;

  private cachedOutput?: MenuItem[];

  transform(items: Readonly<MenuItem[]>, preserveHidden: boolean = false): MenuItem[] {
    if (this.latestItems !== items) {
      this.switchingItems.next();
      this.cachedOutput = undefined;

      this.latestItems = items;

      combineMenuUpdateNotificationsRefreshing(...items)
        .pipe(
          untilDestroyed(this),
          takeUntil(this.switchingItems),
          autoMarkForCheck(this.cd),
        )
        .subscribe(() => this.cachedOutput = undefined);
    }

    if (this.latestPreserveHidden !== preserveHidden) {
      this.cachedOutput = undefined;
      this.latestPreserveHidden = preserveHidden;
    }

    if (!this.cachedOutput) {
      this.cachedOutput = duplicateMenuHierarchy(...items);

      if (!preserveHidden) {
        removeHidden(this.cachedOutput);
      }
    }

    return this.cachedOutput;
  }
}

function removeHidden(items: MenuItem[]): void {
  removeByCondition(items, item => item.visible === false);

  for (const item of items) {
    if (item.items) {
      removeHidden(item.items);
    }
  }
}
