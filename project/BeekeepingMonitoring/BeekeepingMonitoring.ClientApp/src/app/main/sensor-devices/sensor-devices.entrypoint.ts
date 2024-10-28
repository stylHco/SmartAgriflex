import {Routes} from "@angular/router";
import {TITLE_PROVIDER_KEY} from "../../@shared/page-title/page-title-provider";
import {translatedScopedTitle} from "../../@shared/page-title/common-title-providers";
import {FormLossPreventionGuard} from "../../@shared/form-loss-prevention/form-loss-prevention.guard";
import {PRESENT_404_KEY} from "../../@shared/error-handling/resolver-error-options";
import {createTranslocoLoader} from "../../@transloco/transloco.helpers";
import {TRANSLOCO_SCOPE, TranslocoScope} from "@ngneat/transloco";
import {ListSensorDevicesComponent} from "./list-sensor-devices/list-sensor-devices.component";
import {
  ViewSensorDeviceComponent,
  ViewSensorDeviceTitleProvider,
} from "./view-sensor-device/view-sensor-device.component";
import {
  ManageSensorDeviceComponent,
  EditSensorDeviceTitleProvider,
} from "./manage-sensor-device/manage-sensor-device.component";
import {
  resolveSensorDevicesList,
  resolveSensorDeviceDetails,
  resolveSensorDeviceForUpdate,
} from "../../@core/sensor-devices/sensor-devices.resolvers";
import {resolveSensorsDropdown} from "../../@core/sensors/sensors.resolvers";
import {resolveDevicesDropdown} from "../../@core/devices/devices.resolvers";

const translocoLoader = createTranslocoLoader(
  // @ts-ignore
  () => import(/* webpackMode: "eager" */ './i18n-sensor-devices/en.json'),
  lang => import(/* webpackChunkName: "sensor-devices-i18n" */ `./i18n-sensor-devices/${lang}.json`)
);

export const routes: Routes = [{
  path: '',
  providers: [
    {
      provide: TRANSLOCO_SCOPE,
      useValue: <TranslocoScope>{scope: 'sensorDevices', loader: translocoLoader},
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
      component: ManageSensorDeviceComponent,
      data: {
        [TITLE_PROVIDER_KEY]: translatedScopedTitle('manage.header.add'),
      },
      resolve: {
        sensors: resolveSensorsDropdown,
        devices: resolveDevicesDropdown,
      },
      canDeactivate: [
        FormLossPreventionGuard,
      ],
    },
    {
      path: 'edit/:id',
      component: ManageSensorDeviceComponent,
      data: {
        [TITLE_PROVIDER_KEY]: EditSensorDeviceTitleProvider,
        [PRESENT_404_KEY]: <string[]> ['item'],
      },
      resolve: {
        item: resolveSensorDeviceForUpdate,
        sensors: resolveSensorsDropdown,
        devices: resolveDevicesDropdown,
      },
      providers: [
        EditSensorDeviceTitleProvider,
      ],
      canDeactivate: [
        FormLossPreventionGuard,
      ],
    },
    {
      path: 'list',
      component: ListSensorDevicesComponent,
      resolve: {
        items: resolveSensorDevicesList,
      },
      data: {
        [TITLE_PROVIDER_KEY]: translatedScopedTitle('list.header'),
      },
    },
    {
      path: 'view/:id',
      component: ViewSensorDeviceComponent,
      data: {
        [TITLE_PROVIDER_KEY]: ViewSensorDeviceTitleProvider,
        [PRESENT_404_KEY]: <string[]> ['item'],
      },
      resolve: {
        item: resolveSensorDeviceDetails,
      },
      providers: [
        ViewSensorDeviceTitleProvider,
      ],
    },
  ],
}];
