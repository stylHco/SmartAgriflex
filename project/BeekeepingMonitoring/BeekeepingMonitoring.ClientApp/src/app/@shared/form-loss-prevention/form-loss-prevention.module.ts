import {NgModule} from '@angular/core';
import {FormLossMonitorDirective} from './form-loss-monitor.directive';

@NgModule({
  declarations: [
    FormLossMonitorDirective,
  ],
  exports: [
    FormLossMonitorDirective,
  ],
})
export class FormLossPreventionModule {
}
