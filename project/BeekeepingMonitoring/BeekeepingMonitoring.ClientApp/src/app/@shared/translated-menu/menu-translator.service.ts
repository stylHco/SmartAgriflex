import {Injectable} from '@angular/core';
import {TranslocoService} from "@ngneat/transloco";
import {
  getAllTranslatableMenuItem,
  getMenuTranslationApplied,
  getMenuTranslationTakeUntil,
  MenuItemAspectTranslationOptions,
  TranslatableMenuItem
} from "./translated-menu.utils";
import {Observable, takeUntil} from "rxjs";
import {map} from "rxjs/operators";
import {MenuItem} from "primeng/api";

/**
 * @deprecated use the dynamic menu translation infrastructure
 */
export interface MenuTranslationSetupOptions {
  takeUntil?: Observable<void>;

  /**
   * The passed observable will be automatically unsubscribed when the
   * translation itself is unsubscribed.
   */
  onAppliedSetup?: (onApplied$: Observable<TranslatableMenuItem>) => void;
}

/**
 * @deprecated use the dynamic menu translation infrastructure
 */
@Injectable({
  providedIn: 'root'
})
export class MenuTranslatorService {
  constructor(
    private readonly transloco: TranslocoService,
  ) {
  }

  public translateAllMenuItems(menuItems: MenuItem[], options?: MenuTranslationSetupOptions): void {
    for (const item of getAllTranslatableMenuItem(...menuItems)) {
      this.translateMenuItem(item, options);
    }
  }

  public translateMenuItem(menuItem: TranslatableMenuItem, options?: MenuTranslationSetupOptions): void {
    let itemTakeUntil = getMenuTranslationTakeUntil(menuItem);

    // Kill existing subscription
    itemTakeUntil.next();

    // Setup here or we will miss the synchronous translation application
    if (options?.onAppliedSetup) {
      let onApplied$ = getMenuTranslationApplied(menuItem)
        .pipe(
          map(() => menuItem),
          takeUntil(itemTakeUntil),
        );

      if (options.takeUntil) {
        onApplied$ = onApplied$
          .pipe(
            takeUntil(options.takeUntil),
          )
      }

      options.onAppliedSetup(onApplied$);
    }

    const setupAspectTranslation = (
      aspectOptions: MenuItemAspectTranslationOptions,
      applyFn: (newValue: any) => void,
    ): void => {
      let translated$ = this.transloco.selectTranslate(
        aspectOptions.key,
        aspectOptions.params,
        aspectOptions.scope,
      )
        .pipe(
          takeUntil(itemTakeUntil),
        );

      if (options?.takeUntil) {
        translated$ = translated$
          .pipe(
            takeUntil(options.takeUntil),
          );
      }

      translated$
        .subscribe(translated => {
          applyFn(translated);

          getMenuTranslationApplied(menuItem).next();
        });
    };

    if (menuItem.labelTranslation) {
      setupAspectTranslation(menuItem.labelTranslation, newValue => menuItem.label = newValue);
    }

    if (menuItem.titleTranslation) {
      setupAspectTranslation(menuItem.titleTranslation, newValue => menuItem.title = newValue);
    }

    if (menuItem.tooltipTranslation) {
      setupAspectTranslation(menuItem.tooltipTranslation, newValue => menuItem.tooltip = newValue);
    }
  }
}
