import {Subject} from "rxjs";
import {MenuItem} from "primeng/api";
import {HashMap, TranslocoScope} from "@ngneat/transloco";

/**
 * @deprecated use the dynamic menu translation infrastructure
 */
export type MenuItemTranslationRuntimeStructures = {
  __translationTakeUntilSubject?: Subject<void>;
  __translationAppliedSubject?: Subject<void>;
};

/**
 * @deprecated use the dynamic menu translation infrastructure
 */
export type MenuItemAspectTranslationOptions = {
  key: string;
  params?: HashMap;
  scope?: TranslocoScope;
};

/**
 * @deprecated use the dynamic menu translation infrastructure
 */
type MenuItemTranslationOptions = {
  labelTranslation?: MenuItemAspectTranslationOptions;
  titleTranslation?: MenuItemAspectTranslationOptions;
  tooltipTranslation?: MenuItemAspectTranslationOptions;
};

/**
 * @deprecated use the dynamic menu translation infrastructure
 */
export type TranslatableMenuItem = MenuItem & MenuItemTranslationOptions & MenuItemTranslationRuntimeStructures;

/**
 * @deprecated use the dynamic menu translation infrastructure
 */
export function isTranslatableMenuItem(menuItem: MenuItem): menuItem is TranslatableMenuItem {
  if ('labelTranslation' in menuItem) return true;
  if ('titleTranslation' in menuItem) return true;
  if ('tooltipTranslation' in menuItem) return true;

  // Just in case, check for runtime structures
  if ('__translationTakeUntilSubject' in menuItem) return true;
  if ('__translationApplied$' in menuItem) return true;

  return false;
}

/**
 * Flattens the menu items hierarchy and filters out the
 * non-translatable items.
 *
 * Not protected against circular menu items graphs.
 *
 * @deprecated use the dynamic menu translation infrastructure
 */
export function getAllTranslatableMenuItem(...menuItems: MenuItem[]): TranslatableMenuItem[] {
  const result: TranslatableMenuItem[] = [];

  for (const menuItem of menuItems) {
    if (isTranslatableMenuItem(menuItem)) {
      result.push(menuItem);
    }

    if (menuItem.items) {
      result.push(...getAllTranslatableMenuItem(...menuItem.items));
    }
  }

  return result;
}

/**
 * @deprecated use the dynamic menu translation infrastructure
 */
export function getMenuTranslationTakeUntil(menuItem: TranslatableMenuItem): Subject<void> {
  if (!menuItem.__translationTakeUntilSubject) {
    menuItem.__translationTakeUntilSubject = new Subject<void>();
  }

  return menuItem.__translationTakeUntilSubject;
}

/**
 * @deprecated use the dynamic menu translation infrastructure
 */
export function getMenuTranslationApplied(menuItem: TranslatableMenuItem): Subject<void> {
  if (!menuItem.__translationAppliedSubject) {
    menuItem.__translationAppliedSubject = new Subject<void>();
  }

  return menuItem.__translationAppliedSubject;
}
