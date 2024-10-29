import {Routes} from "@angular/router";
import {TRANSLOCO_SCOPE, TranslocoScope} from "@ngneat/transloco";
import {createTranslocoLoader} from "../../@transloco/transloco.helpers";
import {ViewSensorLocationComponent} from "./view-sensor-location/view-sensor-location.component";
import {resolveDeviceInfo, resolveDevicesDropdown} from "../../@core/devices/devices.resolvers";
const translocoLoader = createTranslocoLoader(
  // @ts-ignore
  () => import(/* webpackMode: "eager" */ './i18n-sensor-location/en.json'),
  lang => import(/* webpackChunkName: "sensor-location-i18n" */ `./i18n-sensor-location/${lang}.json`)
);
export const routes: Routes = [{
  path: '',
  providers: [
    {
      provide: TRANSLOCO_SCOPE,
      useValue: <TranslocoScope>{scope: 'location', loader: translocoLoader},
    },
  ],
  children: [
    {
      path: '',
      pathMatch: 'full',
      redirectTo: 'sensor-locations',
    },
    {
      path: 'sensor-locations',
      component: ViewSensorLocationComponent,
      resolve: {
        availableDevices: resolveDevicesDropdown,
      }
    },
    {
      path: 'sensor-locations/:id',
      component:ViewSensorLocationComponent ,
      resolve: {
        availableDevices: resolveDevicesDropdown,
        deviceInfo: resolveDeviceInfo
      }
    }
  ]
}];
