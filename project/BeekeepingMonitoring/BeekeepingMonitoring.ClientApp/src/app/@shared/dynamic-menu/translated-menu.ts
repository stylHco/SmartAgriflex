import {HashMap, TranslocoScope, TranslocoService} from "@ngneat/transloco";
import {MonoTypeOperatorFunction, Observable, Subject, takeUntil} from "rxjs";
import {MenuItem} from "primeng/api";
import {Injectable} from "@angular/core";
import {getAllMenuItems} from "./dynamic-menu.utils";
import {getMenuUpdatedNotification} from "./dynamic-menu.notification";

export type MenuItemAspectTranslationOptions = {
  key: string;
  params?: HashMap;
  scope?: TranslocoScope;
};

export const MenuLabelTranslation: unique symbol = Symbol();
export const MenuTitleTranslation: unique symbol = Symbol();
export const MenuTooltipTranslation: unique symbol = Symbol();

const MenuTranslationTakeUntil: unique symbol = Symbol();

declare module 'primeng/api' {
  interface MenuItem {
    [MenuLabelTranslation]?: MenuItemAspectTranslationOptions;
    [MenuTitleTranslation]?: MenuItemAspectTranslationOptions;
    [MenuTooltipTranslation]?: MenuItemAspectTranslationOptions;

    [MenuTranslationTakeUntil]?: Subject<void>;
  }
}

export function getMenuTranslationTakeUntil(menuItem: MenuItem): Subject<void> {
  if (!menuItem[MenuTranslationTakeUntil]) {
    menuItem[MenuTranslationTakeUntil] = new Subject<void>();
  }

  return menuItem[MenuTranslationTakeUntil];
}

@Injectable({
  providedIn: 'root'
})
export class MenuTranslatorService {
  constructor(
    private readonly transloco: TranslocoService,
  ) {
  }

  public translateAllMenuItems(menuItems: Readonly<MenuItem[]>, options?: MenuTranslationSetupOptions): void {
    for (const item of getAllMenuItems(...menuItems)) {
      this.translateMenuItem(item, options);
    }
  }

  public translateMenuItem(menuItem: MenuItem, options?: MenuTranslationSetupOptions): void {
    const itemTakeUntil = getMenuTranslationTakeUntil(menuItem);

    // Kill existing subscription
    itemTakeUntil.next();

    const setupAspectTranslation = (
      aspectOptions: MenuItemAspectTranslationOptions | undefined,
      applyFn: (newValue: any) => void,
    ): void => {
      if (!aspectOptions) return;

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

      if (options?.pipe) {
        translated$ = translated$.pipe(options.pipe);
      }

      translated$
        .subscribe(translated => {
          applyFn(translated);
          getMenuUpdatedNotification(menuItem).next();
        });
    };

    setupAspectTranslation(menuItem[MenuLabelTranslation], newValue => menuItem.label = newValue);
    setupAspectTranslation(menuItem[MenuTitleTranslation], newValue => menuItem.title = newValue);
    setupAspectTranslation(menuItem[MenuTooltipTranslation], newValue => menuItem.tooltip = newValue);
  }
}

export interface MenuTranslationSetupOptions {
  takeUntil?: Observable<void>;

  /**
   * If specified, this will be applied to the translation observable
   */
  pipe?: MonoTypeOperatorFunction<any>;
}
