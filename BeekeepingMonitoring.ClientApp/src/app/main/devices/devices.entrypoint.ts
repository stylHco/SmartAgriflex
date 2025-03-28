import {Routes} from "@angular/router";
import {TITLE_PROVIDER_KEY} from "../../@shared/page-title/page-title-provider";
import {translatedScopedTitle} from "../../@shared/page-title/common-title-providers";
import {FormLossPreventionGuard} from "../../@shared/form-loss-prevention/form-loss-prevention.guard";
import {PRESENT_404_KEY} from "../../@shared/error-handling/resolver-error-options";
import {createTranslocoLoader} from "../../@transloco/transloco.helpers";
import {TRANSLOCO_SCOPE, TranslocoScope} from "@ngneat/transloco";
import {ListDevicesComponent} from "./list-devices/list-devices.component";
import {ViewDeviceComponent, ViewDeviceTitleProvider} from "./view-device/view-device.component";
import {ManageDeviceComponent, EditDeviceTitleProvider} from "./manage-device/manage-device.component";
import {
  resolveDevicesList,
  resolveDeviceDetails,
  resolveDeviceForUpdate,
} from "../../@core/devices/devices.resolvers";

const translocoLoader = createTranslocoLoader(
  // @ts-ignore
  () => import(/* webpackMode: "eager" */ './i18n-devices/en.json'),
  lang => import(/* webpackChunkName: "devices-i18n" */ `./i18n-devices/${lang}.json`)
);

export const routes: Routes = [{
  path: '',
  providers: [
    {
      provide: TRANSLOCO_SCOPE,
      useValue: <TranslocoScope>{scope: 'devices', loader: translocoLoader},
    },
  ],
  children: [
    {
      path: '',
      pathMatch: 'full',
      redirectTo: 'list',
    },
    {
      path: 'add',
      component: ManageDeviceComponent,
      data: {
        [TITLE_PROVIDER_KEY]: translatedScopedTitle('manage.header.add'),
      },
      canDeactivate: [
        FormLossPreventionGuard,
      ],
    },
    {
      path: 'edit/:id',
      component: ManageDeviceComponent,
      data: {
        [TITLE_PROVIDER_KEY]: EditDeviceTitleProvider,
        [PRESENT_404_KEY]: <string[]> ['item'],
      },
      resolve: {
        item: resolveDeviceForUpdate,
      },
      providers: [
        EditDeviceTitleProvider,
      ],
      canDeactivate: [
        FormLossPreventionGuard,
      ],
    },
    {
      path: 'list',
      component: ListDevicesComponent,
      resolve: {
        items: resolveDevicesList,
      },
      data: {
        [TITLE_PROVIDER_KEY]: translatedScopedTitle('list.header'),
      },
    },
    {
      path: 'view/:id',
      component: ViewDeviceComponent,
      data: {
        [TITLE_PROVIDER_KEY]: ViewDeviceTitleProvider,
        [PRESENT_404_KEY]: <string[]> ['item'],
      },
      resolve: {
        item: resolveDeviceDetails,
      },
      providers: [
        ViewDeviceTitleProvider,
      ],
    },
  ],
}];
