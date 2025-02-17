import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MenuItem} from "primeng/api";
import {IsActiveMatchOptions} from "@angular/router";

const fallbackRouterMatchOptions: IsActiveMatchOptions = {
  // Most of our content is actually at sub-path, e.g.
  // `/app/countries` -> `/app/countries/list` or `/app/dashboard` -> `/app/dashboard/1`
  paths: 'subset',

  queryParams: 'ignored',
  matrixParams: 'ignored',
  fragment: 'ignored',
};

@Component({
  selector: 'app-main-segment-menu',
  templateUrl: './main-segment-menu.component.html',
  styleUrls: ['./main-segment-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainSegmentMenuComponent {
  protected readonly fallbackRouterMatchOptions = fallbackRouterMatchOptions;

  // Note that separators are not supported (no styling for them)
  items: MenuItem[] = [
    {
      label: 'Home',
      items: [
        {label: 'Dashboard', icon: 'pi pi-fw pi-chart-bar', routerLink: '/app/dashboards/configurable'},
      ],
    },
    {
      label: 'Data Visualization',
      items: [
        {label: 'Live Data', icon: 'pi pi-fw pi-sync', routerLink: '/app/live-data'},
        {label: 'History', icon: 'pi pi-fw pi-chart-line', routerLink: '/app/history-data'},
        {label: 'Locations', icon: 'pi pi-fw pi-map-marker', routerLink: '/app/sensors'},
      ],
    },
    {
      label: 'Data management',
      items: [
        {label: 'Custom Rules', icon: 'pi pi-fw pi-briefcase', routerLink: '/app/custom-rules'},
        {label: 'Devices', icon: 'pi pi-fw pi-briefcase', routerLink: '/app/devices'},
        {label: 'Sensors', icon: 'pi pi-fw pi-briefcase', routerLink: '/app/sensors'},
        {label: 'Sensor devices', icon: 'pi pi-fw pi-briefcase', routerLink: '/app/sensor-devices'},
        {label: 'Sensor device datas', icon: 'pi pi-fw pi-briefcase', routerLink: '/app/sensor-device-datas'},
        // Add entries for your features here
      ],
    },
  ];
}
