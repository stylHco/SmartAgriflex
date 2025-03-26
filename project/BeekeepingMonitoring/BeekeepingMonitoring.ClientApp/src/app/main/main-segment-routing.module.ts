import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MainSegmentComponent} from "./main-segment.component";
import {MustLoginGuard} from "../@core/auth/must-login.guard";

const routes: Routes = [{
  path: '',
  component: MainSegmentComponent,
  canActivateChild: [
    MustLoginGuard,
  ],
  children: [
    {
      path: '',
      redirectTo: 'dashboards/custom',
      pathMatch: 'full',
    },
    {
      path: 'dashboards',
      children: [
        {
          path: 'custom',
          loadChildren: () => import('./dashboards/custom-dashboards/custom-dashboards.entrypoint')
            .then(m => m.routes),
        },
      ],
    },
    {
      path: 'account',
      loadChildren: () => import('./account/account.module')
        .then(m => m.AccountModule),
    },
    {
      path: 'devices',
      loadChildren: () => import('./devices/devices.entrypoint')
        .then(m => m.routes),
    },
    {
      path: 'custom-rules',
      loadChildren: () => import('./custom-rules/custom-rules.entrypoint')
        .then(m => m.routes),
    },
    {
      path: 'sensors',
      loadChildren: () => import('./sensors/sensors.entrypoint')
        .then(m => m.routes),
    },
    {
      path: 'sensor-devices',
      loadChildren: () => import('./sensor-devices/sensor-devices.entrypoint')
        .then(m => m.routes),
    },
    {
      path: 'sensor-device-datas',
      loadChildren: () => import('./sensor-device-datas/sensor-device-datas.entrypoint')
        .then(m => m.routes),
    },
    {
      path: 'live-data',
      loadChildren: () => import('./live-charts/live-charts.entrypoint')
        .then(m => m.routes),
    },
    {
      path: 'history-data',
      loadChildren: () => import('./history-charts/history-charts.entrypoint')
        .then(m => m.routes),
    },
    {
      path: 'sensor-location',
      loadChildren: () => import('./sensor-locations/sensor-locations.entrypoint')
        .then(m => m.routes),
    },
    // Add routes for your features here
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainSegmentRoutingModule {
}
