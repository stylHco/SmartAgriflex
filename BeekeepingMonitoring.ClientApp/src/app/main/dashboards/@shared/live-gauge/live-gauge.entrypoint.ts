import {Routes} from "@angular/router";
import {resolveDevicesDropdown} from "../../../../@core/devices/devices.resolvers";
import {LiveGaugeComponent} from "./live-gauge.component";

export const routes: Routes = [{
  path: '',
  component: LiveGaugeComponent,
}];
