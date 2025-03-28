import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthSegmentComponent} from "./auth-segment.component";
import {RedirectIfAuthenticatedGuard} from "../@core/auth/redirect-if-authenticated.guard";
import {LoginComponent} from "./login/login.component";
import {FormLossPreventionGuard} from "../@shared/form-loss-prevention/form-loss-prevention.guard";
import {RegisterComponent} from "./register/register.component";
import {NotFoundSilentRedirectComponent} from "../misc/not-found-silent-redirect.component";
import {TITLE_PROVIDER_KEY} from "../@shared/page-title/page-title-provider";
import {staticTitle, translatedScopedTitle} from "../@shared/page-title/common-title-providers";
import {RequestPasswordResetComponent} from "./request-password-reset/request-password-reset.component";
import {CompletePasswordResetComponent} from "./complete-password-reset/complete-password-reset.component";
import {ConfirmEmailComponent} from "./confirm-email/confirm-email.component";
import {ResendEmailConfirmationComponent} from "./resend-email-confirmation/resend-email-confirmation.component";

const routes: Routes = [{
  path: '',
  component: AuthSegmentComponent,
  canActivate: [
    RedirectIfAuthenticatedGuard,
  ],
  children: [
    {
      path: '',
      pathMatch: 'full',
      component: NotFoundSilentRedirectComponent,
    },
    {
      path: 'login',
      component: LoginComponent,
      data: {
        [TITLE_PROVIDER_KEY]: translatedScopedTitle('login.header'),
      },
      canDeactivate: [FormLossPreventionGuard],
    },
    {
      path: 'register',
      component: RegisterComponent,
      data: {
        [TITLE_PROVIDER_KEY]: translatedScopedTitle('register.header'),
      },
      canDeactivate: [FormLossPreventionGuard],
    },
    {
      path: 'request-password-reset',
      component: RequestPasswordResetComponent,
      data: {
        [TITLE_PROVIDER_KEY]: staticTitle({localTitle: 'Reset password'}),
      },
      canDeactivate: [FormLossPreventionGuard],
    },
    {
      path: 'complete-password-reset',
      component: CompletePasswordResetComponent,
      data: {
        [TITLE_PROVIDER_KEY]: staticTitle({localTitle: 'Reset password'}),
      },
      canDeactivate: [FormLossPreventionGuard],
    },
    {
      path: 'confirm-email',
      component: ConfirmEmailComponent,
      data: {
        [TITLE_PROVIDER_KEY]: staticTitle({localTitle: 'Confirm email'}),
      },
      canDeactivate: [FormLossPreventionGuard],
    },
    {
      path: 'resend-email-confirmation',
      component: ResendEmailConfirmationComponent,
      data: {
        [TITLE_PROVIDER_KEY]: staticTitle({localTitle: 'Resend email confirmation'}),
      },
      canDeactivate: [FormLossPreventionGuard],
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthSegmentRoutingModule {
}
