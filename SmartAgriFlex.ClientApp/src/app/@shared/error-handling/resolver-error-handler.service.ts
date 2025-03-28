import {Injectable, OnDestroy} from '@angular/core';
import {ActivatedRouteSnapshot, ChildActivationEnd, Router} from "@angular/router";
import {Subject, takeUntil} from "rxjs";
import {ApiResult} from "../utils/api-result";
import {sendToInternalError, sendToNotFound} from "./error-handling.helpers";
import {
  IGNORE_API_ERRORS_KEY,
  PRESENT_404_KEY,
  SUPPRESS_API_ERROR_HANDLING_KEY,
  SuppressApiErrorHandlingMode
} from "./resolver-error-options";

class TreeEvaluationContext {
  public hasNotFound = false;
  public hasError = false;
}

function getSuppressMode(route: ActivatedRouteSnapshot) : SuppressApiErrorHandlingMode {
  return route.routeConfig?.data?.[SUPPRESS_API_ERROR_HANDLING_KEY] ?? SuppressApiErrorHandlingMode.None;
}

/**
 * The goal of this service is to automatically handle not found/internal errors in API requests
 * made by resolvers.
 *
 * Important: if this service causes a redirect, `ngOnInit()` and title provider won't be called,
 * but the component's constructor and `ngOnDestroy()` still will be.
 *
 * Details: we want to show the URL of the intended (failed) navigation, but when using
 * the deferred url update strategy, the update happens only after all resolvers have produced
 * their values. As such resolvers themselves or `ResolveEnd` event are too early to do the
 * redirect. Unfortunately the next events are the (`Child`)`ActivationEnd`, which ideally we
 * would like to avoid (as we are spending effort on instantiating components only to instantly
 * tear them down). At the very least, `NavigationEnd` and `ngOnInit()` are not invoked for the
 * aborted navigation, which means that the component(s)/title providers don't need to check
 * for the resolver result validity.
 */
@Injectable()
export class ResolverErrorHandlerService implements OnDestroy {
  private stopSubject = new Subject<undefined>();

  constructor(
    private readonly router: Router,
  ) {
  }

  public enable(): void {
    this.disable();

    this.router.events
      .pipe(
        takeUntil(this.stopSubject),
      )
      .subscribe(event => {
        // We evaluate when the entire tree has been activated so that 404s are prioritized over
        // 500s (e.g. 404 for parent route might cause a 500 for child route due to assumptions).
        if (!(event instanceof ChildActivationEnd)) return;
        if (event.snapshot.parent !== null) return;

        if (this.shouldIgnoreNavigation(event.snapshot.root)) {
          console.debug('Found SuppressApiErrorHandlingMode.Full, skipping checking resolver results');
          return;
        }

        this.onActivationFullyComplete(event.snapshot.root);
      });
  }

  public disable(): void {
    this.stopSubject.next(undefined);
  }

  private shouldIgnoreNavigation(current: ActivatedRouteSnapshot): boolean {
    if (getSuppressMode(current) === SuppressApiErrorHandlingMode.Full) {
      return true;
    }

    for (let child of current.children) {
      if (this.shouldIgnoreNavigation(child)) {
        return true;
      }
    }

    return false;
  }

  private onActivationFullyComplete(root: ActivatedRouteSnapshot): void {
    const context = new TreeEvaluationContext();

    this.evaluateNode(root, context);

    if (context.hasNotFound) {
      sendToNotFound(this.router);
    } else if (context.hasError) {
      sendToInternalError(this.router);
    }
  }

  private evaluateNode(current: ActivatedRouteSnapshot, context: TreeEvaluationContext): void {
    // Scan children
    for (let child of current.children) {
      this.evaluateNode(child, context);
    }

    // Don't care about nodes that have no config
    if (!current.routeConfig) return;

    // Bail if we are told to skip checking this route
    if (getSuppressMode(current) !== SuppressApiErrorHandlingMode.None) return;

    const routeData = current.routeConfig.data ?? {};
    const presentNotFoundKeys = <string[]> routeData[PRESENT_404_KEY] ?? [];
    const ignoreKeys = <string[]> routeData[IGNORE_API_ERRORS_KEY] ?? [];

    for (let resolveKey in current.routeConfig.resolve) {
      if (ignoreKeys.includes(resolveKey)) continue;

      const result = current.data[resolveKey];
      if (!(result instanceof ApiResult)) continue;

      if (result.isNotFound && presentNotFoundKeys.includes(resolveKey)) context.hasNotFound = true;
      else if (!result.isSuccess) context.hasError = true;
    }
  }

  ngOnDestroy(): void {
    this.disable();
  }
}
