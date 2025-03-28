import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LoginComponent} from './login.component';
import {PasswordModule} from "primeng/password";
import {CheckboxModule} from "primeng/checkbox";
import {ButtonModule} from "primeng/button";
import {InputTextModule} from "primeng/inputtext";
import {TranslocoModule} from "@ngneat/transloco";
import {ReactiveFormsModule} from "@angular/forms";
import {FormLossPreventionModule} from "../../@shared/form-loss-prevention/form-loss-prevention.module";
import {FormControlErrorsModule} from "../../@shared/form-control-errors/form-control-errors.module";
import {IdNamespaceModule} from "../../@shared/id-namespace/id-namespace.module";
import {RouterModule} from "@angular/router";

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([]),
    PasswordModule,
    CheckboxModule,
    ButtonModule,
    InputTextModule,
    TranslocoModule,
    ReactiveFormsModule,
    FormLossPreventionModule,
    FormControlErrorsModule,
    IdNamespaceModule,
  ],
  declarations: [
    LoginComponent,
  ]
})
export class LoginModule {
}
