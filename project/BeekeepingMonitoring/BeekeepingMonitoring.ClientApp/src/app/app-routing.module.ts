import {Injectable, NgModule} from '@angular/core';
import {
  ActivatedRouteSnapshot,
  BaseRouteReuseStrategy,
  ExtraOptions,
  RouteReuseStrategy,
  RouterModule,
  Routes
} from '@angular/router';
import {NotFoundComponent} from "./misc/not-found/not-found.component";
import {InternalErrorComponent, IS_INTERNAl_RESOLVE_KEY} from "./misc/internal-error/internal-error.component";
import {IsInternalNavigationResolver} from "./@shared/utils/is-internal-navigation.resolver";
import {TITLE_PROVIDER_KEY} from "./@shared/page-title/page-title-provider";
import {staticTitle} from "./@shared/page-title/common-title-providers";
import {
  SUPPRESS_API_ERROR_HANDLING_KEY,
  SuppressApiErrorHandlingMode
} from "./@shared/error-handling/resolver-error-options";
import {REUSE_MODE_KEY, RouteReuseMode} from "./@shared/utils/routing-helpers";

const routes: Routes = [
  {
    path: '',
    redirectTo: 'app',
    pathMatch: 'full',
  },
  {
    path: 'app',
    loadChildren: () => import('./main/main-segment.module')
      .then(m => m.MainSegmentModule),
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth-segment.module')
      .then(m => m.AuthSegmentModule),
  },
  {
    path: '_internal/error',
    component: InternalErrorComponent,
    data: {
      [TITLE_PROVIDER_KEY]: staticTitle({localTitle: 'Internal error'}),
      [SUPPRESS_API_ERROR_HANDLING_KEY]: SuppressApiErrorHandlingMode.Full,
    },
    resolve: {
      [IS_INTERNAl_RESOLVE_KEY]: IsInternalNavigationResolver,
    },
  },
  {
    path: '**',
    component: NotFoundComponent,
    data: {
      [TITLE_PROVIDER_KEY]: staticTitle({localTitle: 'Not found'}),
      [SUPPRESS_API_ERROR_HANDLING_KEY]: SuppressApiErrorHandlingMode.Full,
    },
  },
];

// Note: internal error and not found pages/components are intentionally not localized
// as there is no language switcher there.

const routerConfig: ExtraOptions = {
  // enableTracing: !environment.production
};

/**
 * @todo: Outdated description, added option
 *
 * Our components do not support live substitution of params/data and it's
 * complexity we don't need right now, even if somewhere there is a link
 * that leads from and to the same component.
 *
 * If some component does indeed support reuse, make this controllable via
 * an entry in the data map. Note that the ActivateRoute::data/paramMap/etc
 * when reused fire right after ResolveEnd, which is before ResolverErrorHandlerService
 * does its thing (hence there is no guarantee that API errors were already checked)
 */
@Injectable()
class AppRouteReuseStrategy extends BaseRouteReuseStrategy {
  override shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    if (!super.shouldReuseRoute(future, curr)) return false;
    if (!permitReuse(future)) return false;

    return true;
  }
}

function permitReuse(snapshot: ActivatedRouteSnapshot): boolean {
  const config = snapshot.routeConfig;
  if (!config) return true; // "virtual" route (not one defined by us), e.g. root

  switch (config.data?.[REUSE_MODE_KEY] ?? RouteReuseMode.Default) {
    case RouteReuseMode.Permit:
      return true;

    case RouteReuseMode.Default:
      if (config.children) return true;
      if (config.loadChildren) return true;
  }

  // No reason to reuse
  return false;
}

@NgModule({
  imports: [RouterModule.forRoot(routes, routerConfig)],
  exports: [RouterModule],
  providers: [
    {
      provide: RouteReuseStrategy,
      useClass: AppRouteReuseStrategy,
    }
  ],
})
export class AppRoutingModule {
}
