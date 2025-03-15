import {Routes} from "@angular/router";
import {LiveDataForSensorComponent} from "./live-data-for-sensor.component";
import {resolveSensorDeviceDatasList} from "../../../../@core/sensor-device-datas/sensor-device-datas.resolvers";
import {resolveDevicesDropdown} from "../../../../@core/devices/devices.resolvers";

export const routes: Routes = [{
  path: '',
  component: LiveDataForSensorComponent,
  resolve: {
    allSensorData: resolveSensorDeviceDatasList,
    availableDevices: resolveDevicesDropdown,
  }
}];
