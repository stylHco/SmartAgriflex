import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ManagePasswordComponent} from './manage-password.component';
import {PanelModule} from "primeng/panel";
import {ReactiveFormsModule} from "@angular/forms";
import {FormLossPreventionModule} from "../../../@shared/form-loss-prevention/form-loss-prevention.module";
import {IdNamespaceModule} from "../../../@shared/id-namespace/id-namespace.module";
import {RequiredFieldIndicatorModule} from "../../../@shared/required-field-indicator/required-field-indicator.module";
import {FormControlErrorsModule} from "../../../@shared/form-control-errors/form-control-errors.module";
import {ButtonModule} from "primeng/button";
import {BlockUIModule} from "primeng/blockui";
import {ProgressSpinnerModule} from "primeng/progressspinner";
import {TranslocoModule} from "@ngneat/transloco";
import {PasswordModule} from "primeng/password";

@NgModule({
  imports: [
    CommonModule,
    PanelModule,
    ReactiveFormsModule,
    FormLossPreventionModule,
    IdNamespaceModule,
    RequiredFieldIndicatorModule,
    FormControlErrorsModule,
    ButtonModule,
    BlockUIModule,
    ProgressSpinnerModule,
    TranslocoModule,
    PasswordModule,
  ],
  declarations: [
    ManagePasswordComponent,
  ],
})
export class ManagePasswordModule {
}
