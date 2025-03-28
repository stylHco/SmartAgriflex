import {ObjectUtils} from "primeng/utils";
import {LocalDate, nativeJs} from "@js-joda/core";
import {APP_INITIALIZER, inject, StaticProvider} from "@angular/core";
import {FilterService} from "primeng/api";

// IMPORTANT: anything referenced in this file will end up being pulled into the initial
// bundle (and probably executed on startup) - be very mindful of what you put here.

export function patchJodaGlobal(): void {
  const innerCompare = ObjectUtils.compare;

  ObjectUtils.compare = (value1, value2, locale, order) => {
    if (value1 instanceof LocalDate && value2 instanceof LocalDate) {
      return value1.compareTo(value2);
    }

    return innerCompare.call(ObjectUtils, value1, value2, locale, order);
  }
}

export const RootJodaPatchInitializer: StaticProvider = {
  provide: APP_INITIALIZER,
  multi: true,

  useFactory: () => {
    const service = inject(FilterService);

    return () => patchFilterService(service);
  },
};

// Ideally this should be done in bundles where LocalDate filters are used, but rn that would require too more
// convoluted code that I can spend time making.
function patchFilterService(service: FilterService): void {
  patchFilterWithLocalDate('dateIs', (value, filter) => value.isEqual(filter));
  patchFilterWithLocalDate('dateIsNot', (value, filter) => !value.isEqual(filter));
  patchFilterWithLocalDate('dateAfter', (value, filter) => value.isAfter(filter));
  patchFilterWithLocalDate('dateBefore', (value, filter) => value.isBefore(filter));

  function patchFilterWithLocalDate<Name extends keyof FilterService['filters']>(
    name: Name,
    localDateFn: LocalDateFilterFn,
  ): void {
    const original = service.filters[name];

    service.filters[name] = (value: any, filter: any) => {
      if (value instanceof LocalDate && filter instanceof Date) {
        return localDateFn(value, LocalDate.from(nativeJs(filter)));
      }

      return original.call(service, value, filter);
    };
  }
}

type LocalDateFilterFn = (value: LocalDate, filter: LocalDate) => boolean;
