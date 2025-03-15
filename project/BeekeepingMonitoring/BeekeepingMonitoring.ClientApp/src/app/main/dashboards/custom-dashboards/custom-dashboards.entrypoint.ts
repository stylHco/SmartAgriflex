import {Routes} from "@angular/router";
import {CustomDashboardComponent} from "./custom-dashboard/custom-dashboard.component";
import {createTranslocoLoader} from "../../../@transloco/transloco.helpers";
import {TRANSLOCO_SCOPE, TranslocoScope} from "@ngneat/transloco";


const translocoLoader = createTranslocoLoader(
  // @ts-ignore
  () => import(/* webpackMode: "eager" */ './i18n-custom-dashboards/en.json'),
  lang => import(/* webpackChunkName: "custom-dashboards-i18n" */ `./i18n-custom-dashboards/${lang}.json`)
);
export const routes: Routes = [{
  path: '',
  component: CustomDashboardComponent,
  providers: [
    {
      provide: TRANSLOCO_SCOPE,
      useValue: <TranslocoScope>{scope: 'customDashboards', loader: translocoLoader},
    },
  ],
}];
