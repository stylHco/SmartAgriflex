import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ConfirmEmailComponent} from './confirm-email.component';
import {RouterModule} from "@angular/router";
import {TranslocoModule} from "@ngneat/transloco";
import {IdNamespaceModule} from "../../@shared/id-namespace/id-namespace.module";
import {ReactiveFormsModule} from "@angular/forms";
import {FormLossPreventionModule} from "../../@shared/form-loss-prevention/form-loss-prevention.module";
import {InputTextModule} from "primeng/inputtext";
import {FormControlErrorsModule} from "../../@shared/form-control-errors/form-control-errors.module";
import {ButtonModule} from "primeng/button";

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
    ConfirmEmailComponent,
  ],
})
export class ConfirmEmailModule {
}
