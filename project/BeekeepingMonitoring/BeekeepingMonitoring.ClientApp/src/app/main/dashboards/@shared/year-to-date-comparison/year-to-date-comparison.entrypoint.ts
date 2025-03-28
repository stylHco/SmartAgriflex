import {Routes} from "@angular/router";
import {LiveDataForSensorComponent} from "./live-data-for-sensor.component";
import {resolveDevicesDropdown} from "../../../../@core/devices/devices.resolvers";

export const routes: Routes = [{
  path: '',
  component: LiveDataForSensorComponent,
  resolve: {
    availableDevices: resolveDevicesDropdown,
  }
}];
