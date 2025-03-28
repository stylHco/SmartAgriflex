import {Routes} from "@angular/router";
import {TITLE_PROVIDER_KEY} from "../../@shared/page-title/page-title-provider";
import {translatedScopedTitle} from "../../@shared/page-title/common-title-providers";
import {FormLossPreventionGuard} from "../../@shared/form-loss-prevention/form-loss-prevention.guard";
import {PRESENT_404_KEY} from "../../@shared/error-handling/resolver-error-options";
import {createTranslocoLoader} from "../../@transloco/transloco.helpers";
import {TRANSLOCO_SCOPE, TranslocoScope} from "@ngneat/transloco";
import {ListSensorsComponent} from "./list-sensors/list-sensors.component";
import {ViewSensorComponent, ViewSensorTitleProvider} from "./view-sensor/view-sensor.component";
import {ManageSensorComponent, EditSensorTitleProvider} from "./manage-sensor/manage-sensor.component";
import {
  resolveSensorsList,
  resolveSensorDetails,
  resolveSensorForUpdate,
} from "../../@core/sensors/sensors.resolvers";

const translocoLoader = createTranslocoLoader(
  // @ts-ignore
  () => import(/* webpackMode: "eager" */ './i18n-sensors/en.json'),
  lang => import(/* webpackChunkName: "sensors-i18n" */ `./i18n-sensors/${lang}.json`)
);

export const routes: Routes = [{
  path: '',
  providers: [
    {
      provide: TRANSLOCO_SCOPE,
      useValue: <TranslocoScope>{scope: 'sensors', loader: translocoLoader},
    },
  ],
  children: [
    {
      path: '',
      pathMatch: 'full',
      redirectTo: 'list',
    },
    {
      path: 'add',
      component: ManageSensorComponent,
      data: {
        [TITLE_PROVIDER_KEY]: translatedScopedTitle('manage.header.add'),
      },
      canDeactivate: [
        FormLossPreventionGuard,
      ],
    },
    {
      path: 'edit/:id',
      component: ManageSensorComponent,
      data: {
        [TITLE_PROVIDER_KEY]: EditSensorTitleProvider,
        [PRESENT_404_KEY]: <string[]> ['item'],
      },
      resolve: {
        item: resolveSensorForUpdate,
      },
      providers: [
        EditSensorTitleProvider,
      ],
      canDeactivate: [
        FormLossPreventionGuard,
      ],
    },
    {
      path: 'list',
      component: ListSensorsComponent,
      resolve: {
        items: resolveSensorsList,
      },
      data: {
        [TITLE_PROVIDER_KEY]: translatedScopedTitle('list.header'),
      },
    },
    {
      path: 'view/:id',
      component: ViewSensorComponent,
      data: {
        [TITLE_PROVIDER_KEY]: ViewSensorTitleProvider,
        [PRESENT_404_KEY]: <string[]> ['item'],
      },
      resolve: {
        item: resolveSensorDetails,
      },
      providers: [
        ViewSensorTitleProvider,
      ],
    },
  ],
}];
