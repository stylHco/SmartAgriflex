import {Routes} from "@angular/router";
import {LiveDataForSensorComponent} from "./live-data-for-sensor.component";
import {resolveDevicesDropdown} from "../../../../@core/devices/devices.resolvers";
import {TRANSLOCO_SCOPE, TranslocoScope} from "@ngneat/transloco";
import {createTranslocoLoader} from "../../../../@transloco/transloco.helpers";


export const routes: Routes = [{
  path: '',
  component: LiveDataForSensorComponent,
  resolve: {
    availableDevices: resolveDevicesDropdown,
  },

}];
