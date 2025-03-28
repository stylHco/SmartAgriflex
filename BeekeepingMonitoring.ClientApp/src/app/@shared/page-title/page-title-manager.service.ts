import {
  EnvironmentInjector,
  Injectable,
  OnDestroy,
  ProviderToken,
  runInInjectionContext
} from '@angular/core';
import {Title} from "@angular/platform-browser";
import {
  ActivatedRouteSnapshot,
  ChildrenOutletContexts,
  NavigationEnd,
  OutletContext,
  PRIMARY_OUTLET,
  Router
} from "@angular/router";
import {
  catchError,
  defaultIfEmpty,
  defer,
  EMPTY,
  filter,
  merge,
  Observable, of,
  Subject,
  switchMap,
  takeUntil
} from "rxjs";
import {PageTitleDef} from "./page-title-def";
import {IPageTitleProvider, TITLE_PROVIDER_KEY, PageTitleProviderFn} from "./page-title-provider";

const PROJECT_TITLE = 'BeekeepingMonitoring';
const TITLE_SUFFIX = ' | ' + PROJECT_TITLE;

function addSuffix(title: string): string {
  return title + TITLE_SUFFIX;
}

// ARS = ActivatedRouteSnapshot
function getDeepestRelevantARS(currentARS: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
  // Try to get the one from primary outlet
  for (let childARS of currentARS.children) {
    if (childARS.outlet == PRIMARY_OUTLET) {
      return getDeepestRelevantARS(childARS);
    }
  }

  // Then, try to get just any child
  if (currentARS.children.length > 0) {
    return getDeepestRelevantARS(currentARS.children[0]);
  }

  // No children, return ourselves
  return currentARS;
}

function getOutletContextFromPath(contexts: ChildrenOutletContexts, path: ActivatedRouteSnapshot[]): OutletContext | null {
  if (path.length < 1) return null;

  // Dupe the array since we will change it
  path = [...path];

  const currentRoute = path.shift();
  const currentContext = contexts.getContext(currentRoute!.outlet); // TODO: wrong

  if (currentContext === null) return null;

  const childContext = getOutletContextFromPath(currentContext.children, path);
  if (childContext !== null) return childContext;

  return currentContext;
}

type TitleProviderSpecification = ProviderToken<IPageTitleProvider> | PageTitleProviderFn;

// Loosely inspired by
// https://github.com/angular/angular/blob/0abb67af59a92a2b29082a259aa9f4ea3fbaab7d/packages/router/src/utils/preactivation.ts#L50
function getProviderFnFromSpec(spec: TitleProviderSpecification, injector: EnvironmentInjector): PageTitleProviderFn {
  const provider = injector.get(spec, null, {optional: true});

  if (provider) {
    return (context) => provider.titleForActivatedRoute(context);
  }

  if (typeof spec === 'function') {
    const fn = spec as PageTitleProviderFn;

    return (context) => runInInjectionContext(injector, () => fn(context));
  }

  throw new Error("Title provider specification could not be fetched from injector and it is not a function");
}

@Injectable()
export class PageTitleManagerService implements OnDestroy {
  private stopUpdatesSubject = new Subject<undefined>();
  private refreshSubject = new Subject<undefined>();

  private readonly updates$: Observable<PageTitleDef>;

  constructor(
    private readonly router: Router,
    private readonly title: Title,
    private readonly rootContexts: ChildrenOutletContexts,
    private readonly rootInjector: EnvironmentInjector,
  ) {
    this.updates$ = this.setupUpdates();
  }

  public enable(): void {
    this.disable();

    this.updates$
      .pipe(
        takeUntil(this.stopUpdatesSubject),
      )
      .subscribe(titleDef => this.applyTitleDef(titleDef));
  }

  public refresh(): void {
    this.refreshSubject.next(undefined);
  }

  public disable(): void {
    this.stopUpdatesSubject.next(undefined);
  }

  ngOnDestroy() {
    this.disable();
  }

  private applyTitleDef(titleDef: PageTitleDef): void {
    let title: string;

    if (titleDef.isProjectTitleOnly) title = PROJECT_TITLE;
    else if (titleDef.appendSuffix) title = addSuffix(titleDef.localTitle!);
    else title = titleDef.localTitle!;

    this.title.setTitle(title);
  }

  private setupUpdates(): Observable<PageTitleDef> {
    const fromCurrentRouterState$ = defer(() => {
      if (!this.router.navigated) return EMPTY;

      let currentARS: ActivatedRouteSnapshot | null = getDeepestRelevantARS(this.router.routerState.snapshot.root);

      while (currentARS !== null) {
        if (currentARS.data.hasOwnProperty(TITLE_PROVIDER_KEY)) {
          const outletContext = getOutletContextFromPath(this.rootContexts, currentARS.pathFromRoot);

          // Prefer the injector assigned to the outlet, if it exists.
          // However, routes that are not lazy-loaded and don't have `providers: []`
          // specified won't have an injector, so fallback to the root one.
          const injector = outletContext?.injector ?? this.rootInjector;

          const spec = currentARS.data[TITLE_PROVIDER_KEY] as TitleProviderSpecification;
          const providerFn = getProviderFnFromSpec(spec, injector);

          return providerFn({
            route: currentARS,
            routerState: this.router.routerState.snapshot,
            component: outletContext?.outlet?.component ?? null,
          });
        }

        currentARS = currentARS.parent;
      }

      // Couldn't find anything, set the default title
      return EMPTY;
    })
      .pipe(
        catchError(err => {
          console.error("Error while resolving page title - will use default until next navigation/refresh.", err);
          return EMPTY;
        }),

        // If we couldn't find any title to use (or an error occured), just set the default (project only)
        defaultIfEmpty(PageTitleDef.DEFAULT),
      );

    const refresh$: Observable<unknown> = merge(
      // On each navigation end
      this.router.events
        .pipe(
          filter(event => event instanceof NavigationEnd),
        ),

      // When manually told to
      this.refreshSubject,

      // When just enabled
      of(undefined),
    );

    return refresh$
      .pipe(
        switchMap(() => fromCurrentRouterState$),
      );
  }
}
