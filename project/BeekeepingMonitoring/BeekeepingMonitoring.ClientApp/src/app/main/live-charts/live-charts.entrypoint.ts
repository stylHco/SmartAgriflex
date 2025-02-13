import {Routes} from "@angular/router";
import {TRANSLOCO_SCOPE, TranslocoScope} from "@ngneat/transloco";
import {createTranslocoLoader} from "../../@transloco/transloco.helpers";
import {ViewLiveChartsComponent} from "./view-live-charts/view-live-charts.component";
import {resolveSensorDeviceDatasList} from "../../@core/sensor-device-datas/sensor-device-datas.resolvers";
import {resolveDevicesDropdown} from "../../@core/devices/devices.resolvers";
import {resolveSensorsDropdown, resolveSensorsList} from "../../@core/sensors/sensors.resolvers";

const translocoLoader = createTranslocoLoader(
  // @ts-ignore
  () => import(/* webpackMode: "eager" */ './i18n-live-charts/en.json'),
  lang => import(/* webpackChunkName: "live-charts-i18n" */ `./i18n-live-charts/${lang}.json`)
);
export const routes: Routes = [{
  path: '',
  providers: [
    {
      provide: TRANSLOCO_SCOPE,
      useValue: <TranslocoScope>{scope: 'liveChart', loader: translocoLoader},
    },
  ],
  children: [
    {
      path: '',
      pathMatch: 'full',
      redirectTo: 'view-live-carts',
    },
    {
      path: 'view-live-carts',
      component: ViewLiveChartsComponent,
      resolve: {
        allSensorData: resolveSensorDeviceDatasList,
        availableDevices: resolveDevicesDropdown,
        availableSensors: resolveSensorsDropdown,
        sensorInfo: resolveSensorsList
      }
    },
    {
      path: 'view-live-carts/:id',
      component: ViewLiveChartsComponent,
      resolve: {
        allSensorData: resolveSensorDeviceDatasList,
        availableDevices: resolveDevicesDropdown,
        availableSensors: resolveSensorsDropdown,
        sensorInfo: resolveSensorsList
      }
    }
  ]
}];
