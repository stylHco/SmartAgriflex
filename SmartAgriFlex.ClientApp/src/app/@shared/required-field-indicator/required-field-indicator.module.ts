import {NgModule} from '@angular/core';
import {RequiredFieldIndicatorComponent} from "./required-field-indicator.component";
import {TranslocoModule} from "@ngneat/transloco";

@NgModule({
  imports: [
    TranslocoModule,
  ],
  declarations: [RequiredFieldIndicatorComponent],
  exports: [RequiredFieldIndicatorComponent],
})
export class RequiredFieldIndicatorModule {
}
