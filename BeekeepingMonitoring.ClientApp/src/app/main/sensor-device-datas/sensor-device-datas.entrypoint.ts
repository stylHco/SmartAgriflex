import {Routes} from "@angular/router";
import {TITLE_PROVIDER_KEY} from "../../@shared/page-title/page-title-provider";
import {translatedScopedTitle} from "../../@shared/page-title/common-title-providers";
import {FormLossPreventionGuard} from "../../@shared/form-loss-prevention/form-loss-prevention.guard";
import {PRESENT_404_KEY} from "../../@shared/error-handling/resolver-error-options";
import {createTranslocoLoader} from "../../@transloco/transloco.helpers";
import {TRANSLOCO_SCOPE, TranslocoScope} from "@ngneat/transloco";
import {ListSensorDeviceDatasComponent} from "./list-sensor-device-datas/list-sensor-device-datas.component";
import {
  ViewSensorDeviceDataComponent,
  ViewSensorDeviceDataTitleProvider,
} from "./view-sensor-device-data/view-sensor-device-data.component";
import {
  ManageSensorDeviceDataComponent,
  EditSensorDeviceDataTitleProvider,
} from "./manage-sensor-device-data/manage-sensor-device-data.component";
import {
  resolveSensorDeviceDatasList,
  resolveSensorDeviceDataDetails,
  resolveSensorDeviceDataForUpdate,
} from "../../@core/sensor-device-datas/sensor-device-datas.resolvers";
import {resolveSensorDevicesDropdown} from "../../@core/sensor-devices/sensor-devices.resolvers";

const translocoLoader = createTranslocoLoader(
  // @ts-ignore
  () => import(/* webpackMode: "eager" */ './i18n-sensor-device-datas/en.json'),
  lang => import(/* webpackChunkName: "sensor-device-datas-i18n" */ `./i18n-sensor-device-datas/${lang}.json`)
);

export const routes: Routes = [{
  path: '',
  providers: [
    {
      provide: TRANSLOCO_SCOPE,
      useValue: <TranslocoScope>{scope: 'sensorDeviceDatas', loader: translocoLoader},
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
      component: ManageSensorDeviceDataComponent,
      data: {
        [TITLE_PROVIDER_KEY]: translatedScopedTitle('manage.header.add'),
      },
      resolve: {
        sensorDevices: resolveSensorDevicesDropdown,
      },
      canDeactivate: [
        FormLossPreventionGuard,
      ],
    },
    {
      path: 'edit/:id',
      component: ManageSensorDeviceDataComponent,
      data: {
        [TITLE_PROVIDER_KEY]: EditSensorDeviceDataTitleProvider,
        [PRESENT_404_KEY]: <string[]> ['item'],
      },
      resolve: {
        item: resolveSensorDeviceDataForUpdate,
        sensorDevices: resolveSensorDevicesDropdown,
      },
      providers: [
        EditSensorDeviceDataTitleProvider,
      ],
      canDeactivate: [
        FormLossPreventionGuard,
      ],
    },
    {
      path: 'list',
      component: ListSensorDeviceDatasComponent,
      resolve: {
        items: resolveSensorDeviceDatasList,
      },
      data: {
        [TITLE_PROVIDER_KEY]: translatedScopedTitle('list.header'),
      },
    },
    {
      path: 'view/:id',
      component: ViewSensorDeviceDataComponent,
      data: {
        [TITLE_PROVIDER_KEY]: ViewSensorDeviceDataTitleProvider,
        [PRESENT_404_KEY]: <string[]> ['item'],
      },
      resolve: {
        item: resolveSensorDeviceDataDetails,
      },
      providers: [
        ViewSensorDeviceDataTitleProvider,
      ],
    },
  ],
}];
