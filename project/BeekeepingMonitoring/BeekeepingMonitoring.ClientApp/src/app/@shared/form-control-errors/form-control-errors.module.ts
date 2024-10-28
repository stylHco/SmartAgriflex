import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormControlErrorsComponent} from "./form-control-errors.component";
import {TranslocoModule} from "@ngneat/transloco";

@NgModule({
  imports: [
    CommonModule,
    TranslocoModule,
  ],
  declarations: [FormControlErrorsComponent],
  exports: [FormControlErrorsComponent],
})
export class FormControlErrorsModule {
}
