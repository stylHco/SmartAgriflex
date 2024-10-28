﻿import {Routes} from "@angular/router";
import {TRANSLOCO_SCOPE, TranslocoScope} from "@ngneat/transloco";
import {createTranslocoLoader} from "../../@transloco/transloco.helpers";
import {resolveSensorsData} from "../../@core/sensors-data/sensors-data.resolver";
import {resolveSensorsDropdown, resolveSensorsList} from "../../@core/sensors/sensors.resolver";
import {ViewHistoryChartsComponent} from "./view-history-charts/view-history-charts.component";
import {resolveDevicesDropdown} from "../../@core/devices/devices.resolver";

const translocoLoader = createTranslocoLoader(
  // @ts-ignore
  () => import(/* webpackMode: "eager" */ './i18n-history-charts/en.json'),
  lang => import(/* webpackChunkName: "history-charts-i18n" */ `./i18n-history-charts/${lang}.json`)
);
export const routes: Routes = [{
  path: '',
  providers: [
    {
      provide: TRANSLOCO_SCOPE,
      useValue: <TranslocoScope>{scope: 'historyChart', loader: translocoLoader},
    },
  ],
  children: [
    {
      path: '',
      pathMatch: 'full',
      redirectTo: 'view-history-charts',
    },
    {
      path: 'view-history-charts',
      component: ViewHistoryChartsComponent,
      resolve: {
        allSensorData: resolveSensorsData,
        availableSensors: resolveSensorsDropdown,
        availableDevices: resolveDevicesDropdown,
        sensorInfo: resolveSensorsList
      }
    },

  ]
}];
