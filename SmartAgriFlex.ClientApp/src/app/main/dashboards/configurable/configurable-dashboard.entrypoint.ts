import {Routes} from "@angular/router";
import {ConfigurableDashboardComponent} from "./configurable-dashboard.component";
import {matchSingleOptionalParam, REUSE_MODE_KEY, RouteReuseMode} from "../../../@shared/utils/routing-helpers";
import {FormLossPreventionGuard} from "../../../@shared/form-loss-prevention/form-loss-prevention.guard";

export const routes: Routes = [{
  matcher: matchSingleOptionalParam('id'),
  component: ConfigurableDashboardComponent,
  data: {
    [REUSE_MODE_KEY]: RouteReuseMode.Permit,
  },
  canDeactivate: [
    FormLossPreventionGuard,
  ],
}];
