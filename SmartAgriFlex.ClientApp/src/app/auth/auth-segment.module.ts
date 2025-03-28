import {NgModule} from '@angular/core';
import {AuthSegmentRoutingModule} from './auth-segment-routing.module';
import {AuthSegmentComponent} from './auth-segment.component';
import {createTranslocoLoader} from "../@transloco/transloco.helpers";
import {TRANSLOCO_SCOPE, TranslocoScope} from "@ngneat/transloco";
import {LoginModule} from "./login/login.module";
import {RegisterModule} from "./register/register.module";
import {RequestPasswordResetModule} from "./request-password-reset/request-password-reset.module";
import {CompletePasswordResetModule} from "./complete-password-reset/complete-password-reset.module";
import {ConfirmEmailModule} from "./confirm-email/confirm-email.module";
import {ResendEmailConfirmationModule} from "./resend-email-confirmation/resend-email-confirmation.module";

const translocoLoader = createTranslocoLoader(
  // @ts-ignore
  () => import(/* webpackMode: "eager" */ './i18n-auth/en.json'),
  lang => import(/* webpackChunkName: "auth-i18n" */ `./i18n-auth/${lang}.json`)
);

@NgModule({
  imports: [
    AuthSegmentRoutingModule,
    LoginModule,
    RegisterModule,
    RequestPasswordResetModule,
    CompletePasswordResetModule,
    ConfirmEmailModule,
    ResendEmailConfirmationModule,
  ],
  declarations: [
    AuthSegmentComponent,
  ],
  providers: [
    {
      provide: TRANSLOCO_SCOPE,
      useValue: <TranslocoScope>{scope: 'auth', loader: translocoLoader},
    },
  ],
})
export class AuthSegmentModule {
}
