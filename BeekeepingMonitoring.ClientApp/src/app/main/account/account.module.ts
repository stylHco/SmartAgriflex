import {NgModule} from '@angular/core';
import {AccountRoutingModule} from './account-routing.module';
import {AccountComponent} from './account.component';
import {ManagePasswordModule} from "./manage-password/manage-password.module";
import {MenuModule} from "primeng/menu";
import {AccountGeneralModule} from "./account-general/account-general.module";
import {createTranslocoLoader} from "../../@transloco/transloco.helpers";
import {TRANSLOCO_SCOPE, TranslocoScope} from "@ngneat/transloco";

const translocoLoader = createTranslocoLoader(
  // @ts-ignore
  () => import(/* webpackMode: "eager" */ './i18n-account/en.json'),
  lang => import(/* webpackChunkName: "account-i18n" */ `./i18n-account/${lang}.json`)
);

@NgModule({
  imports: [
    AccountRoutingModule,
    ManagePasswordModule,
    AccountGeneralModule,

    MenuModule,
  ],
  declarations: [
    AccountComponent,
  ],
  providers: [
    {
      provide: TRANSLOCO_SCOPE,
      useValue: <TranslocoScope>{scope: 'account', loader: translocoLoader},
    },
  ],
})
export class AccountModule {
}
