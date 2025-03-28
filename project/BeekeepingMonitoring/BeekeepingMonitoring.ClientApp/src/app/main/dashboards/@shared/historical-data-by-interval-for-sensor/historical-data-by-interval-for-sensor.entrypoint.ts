import {Routes} from "@angular/router";
import {HistoricalDataByIntervalForSensorComponent} from "./historical-data-by-interval-for-sensor.component";
import {createTranslocoLoader} from "../../../../@transloco/transloco.helpers";
import {TRANSLOCO_SCOPE, TranslocoScope} from "@ngneat/transloco";

const translocoLoader = createTranslocoLoader(
  // @ts-ignore
  () => import(/* webpackMode: "eager" */ './i18n-historical-data-for-sensor/en.json'),
  lang => import(/* webpackChunkName: "live-historical-data-for-sensor-i18n" */ `./i18n-historical-data-for-sensor/${lang}.json`)
);
export const routes: Routes = [{
  path: '',
  component: HistoricalDataByIntervalForSensorComponent,
  providers: [
    {
      provide: TRANSLOCO_SCOPE,
      useValue: <TranslocoScope>{scope: 'historicalData', loader: translocoLoader},
    },
  ],
}];
