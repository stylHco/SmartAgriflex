import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AccountComponent} from "./account.component";
import {ManagePasswordComponent} from "./manage-password/manage-password.component";
import {FormLossPreventionGuard} from "../../@shared/form-loss-prevention/form-loss-prevention.guard";
import {AccountGeneralComponent} from "./account-general/account-general.component";
import {TITLE_PROVIDER_KEY} from "../../@shared/page-title/page-title-provider";
import {translatedScopedTitle} from "../../@shared/page-title/common-title-providers";

const routes: Routes = [{
  path: '',
  component: AccountComponent,
  children: [
    {
      path: '',
      pathMatch: 'full',
      redirectTo: 'password',
    },
    {
      path: 'general',
      component: AccountGeneralComponent,
      data: {
        [TITLE_PROVIDER_KEY]: translatedScopedTitle('general.header'),
      },
    },
    {
      path: 'password',
      component: ManagePasswordComponent,
      data: {
        [TITLE_PROVIDER_KEY]: translatedScopedTitle('managePassword.header'),
      },
      canDeactivate: [
        FormLossPreventionGuard,
      ],
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountRoutingModule {
}
