import {mapToLocalPageTitle, PageTitleDef} from "./page-title-def";
import {EMPTY, map, Observable, of, switchMap, combineLatest} from "rxjs";
import {IPageTitleContext, IPageTitleProvider, PageTitleProviderFn} from "./page-title-provider";
import {TRANSLOCO_SCOPE, TranslocoService} from "@ngneat/transloco";
import {ApiResult} from "../utils/api-result";
import {inject, Injectable} from "@angular/core";
import {Changeable, changeableFromConstValue, isChangeable} from "../utils/changeable";

export function staticTitle(def: Partial<PageTitleDef>): PageTitleProviderFn {
  return () => of(new PageTitleDef(def));
}

export function translatedScopedTitle(key: string): PageTitleProviderFn {
  return () => {
    const translocoService = inject(TranslocoService);

    return translocoService.selectTranslate(key, {}, inject(TRANSLOCO_SCOPE))
      .pipe(
        map(value => new PageTitleDef({localTitle: value})),
      );
  };
}

export abstract class ResolvedApiItemTitleProvider<TItem> implements IPageTitleProvider {
  private readonly translocoService = inject(TranslocoService);
  private readonly translocoScope = inject(TRANSLOCO_SCOPE, {optional: true});

  protected get routeDataKey(): string {
    return 'item';
  }

  protected abstract getItemTitle(item: TItem): string | Changeable<string>;

  protected getTranslocoSuffix(): { key: string; scoped: boolean } | null {
    return null;
  }

  protected getSuffix(): Observable<string | null> {
    const translocoSuffix = this.getTranslocoSuffix();
    if (!translocoSuffix) return of(null);

    if (translocoSuffix.scoped) {
      if (!this.translocoScope) {
        console.error('ResolvedApiItemTitleProvider::getTranslocoSuffix returned {scoped: true}, scope failed to inject');
        return of(null);
      }

      return this.translocoService.selectTranslate(translocoSuffix.key, {}, this.translocoScope);
    }

    return this.translocoService.selectTranslate(translocoSuffix.key);
  }

  titleForActivatedRoute(context: IPageTitleContext): Observable<PageTitleDef> {
    const result = <ApiResult<TItem>>context.route.data[this.routeDataKey];

    if (!result.isSuccess) {
      return EMPTY;
    }

    let changeable = this.getItemTitle(result.value!);

    if (!isChangeable(changeable)) {
      changeable = changeableFromConstValue(changeable);
    }

    return combineLatest({
      title: changeable.value$,
      suffix: this.getSuffix(),
    })
      .pipe(
        map(tuple => {
          let localTitle = tuple.title;
          if (tuple.suffix) localTitle += ' | ' + tuple.suffix;

          return new PageTitleDef({localTitle});
        }),
      );

    // return changeable.value$
    //   .pipe(
    //     map(localTitle => new PageTitleDef({localTitle})),
    //   );
  }
}

// TODO: this is currently broken on initial load as the outlet and component
// are instantiated on the app tick after the initial navigation completes
// (including the router events). Possibly relevant references:
// https://github.com/angular/angular/blob/8a2739f25034443f3a72d57f983e70c1a9d69722/packages/router/src/operators/activate_routes.ts#L204-L208
// https://github.com/angular/angular/blob/e40a640dfe54b03bfe917d08098c319b0b200d25/packages/core/src/application_ref.ts#L1221
// https://angular.io/guide/update-to-version-15#routeroutlet-instantiates-the-component-after-change-detection

@Injectable()
export abstract class EditItemTitleProvider<TComponent = Object | null> implements IPageTitleProvider {
  constructor(
    private readonly translocoService: TranslocoService,
  ) {
  }

  abstract getItemName$(component: TComponent): Observable<string | undefined>;

  titleForActivatedRoute(context: IPageTitleContext): Observable<PageTitleDef> {
    const component = <TComponent>context.component;

    return this.getItemName$(component)
      .pipe(
        switchMap(title => {
          if (typeof title === 'undefined') return EMPTY;

          return this.translocoService.selectTranslate('title.edit_item', {itemName: title})
            .pipe(
              mapToLocalPageTitle(),
            );
        }),
      );
  }
}
