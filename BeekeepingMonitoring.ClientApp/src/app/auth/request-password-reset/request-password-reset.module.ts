import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RequestPasswordResetComponent} from './request-password-reset.component';
import {TranslocoModule} from "@ngneat/transloco";
import {IdNamespaceModule} from "../../@shared/id-namespace/id-namespace.module";
import {ReactiveFormsModule} from "@angular/forms";
import {FormLossPreventionModule} from "../../@shared/form-loss-prevention/form-loss-prevention.module";
import {InputTextModule} from "primeng/inputtext";
import {FormControlErrorsModule} from "../../@shared/form-control-errors/form-control-errors.module";
import {ButtonModule} from "primeng/button";
import {RouterModule} from "@angular/router";

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([]),
    TranslocoModule,
    IdNamespaceModule,
    ReactiveFormsModule,
    FormLossPreventionModule,
    InputTextModule,
    FormControlErrorsModule,
    ButtonModule,
  ],
  declarations: [
    RequestPasswordResetComponent,
  ],
})
export class RequestPasswordResetModule {
}
