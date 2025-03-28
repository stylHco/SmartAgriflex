import {Observable} from "rxjs";
import {PageTitleDef} from "./page-title-def";
import {ActivatedRouteSnapshot, RouterStateSnapshot} from "@angular/router";

export interface IPageTitleContext {
  /**
   * The route snapshot of the route where the title provider was defined. This may be
   * not the most deep activated route (in case the manager searched upwards for a title
   * provider). Check the children or the `routerState` for more info.
   */
  route: ActivatedRouteSnapshot;

  routerState: RouterStateSnapshot;

  /**
   * The component instance that is active for the route where the page title provider
   * is specified.
   */
  component: Object | null;
}

export type PageTitleProviderFn = (context: IPageTitleContext) => Observable<PageTitleDef>;

export interface IPageTitleProvider {
  titleForActivatedRoute(context: IPageTitleContext): Observable<PageTitleDef>;
}

/**
  * Specify this key in a route's `data` object to instruct the page title manager
  * to use the value to generate the page title. The manager will search upwards
  * from the latest activated route and use the first provider it finds. If
  * the manager finds none, it will default to just the project title.
  *
  * The value must be either an angular DI token or a function. The former is
  * expected to return an `IPageTitleProvider` when fetched from the injector.
  * The latter is expected to be a `PageTitleProviderFn`, which will be executed
  * in context of the injector, so you can use `inject()` (from "@angular/core")
  * to fetch services. In both cases, the parent injector of the component at
  * that route will be used (but not the component's injector).
 */
export const TITLE_PROVIDER_KEY = "__TITLE_PROVIDER";
