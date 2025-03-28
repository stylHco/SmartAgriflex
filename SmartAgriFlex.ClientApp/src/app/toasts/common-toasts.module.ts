import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CommonToastsComponent} from './common-toasts.component';
import {ToastModule} from "primeng/toast";
import {MessageService} from "primeng/api";

@NgModule({
  imports: [
    CommonModule,
    ToastModule,
  ],
  declarations: [
    CommonToastsComponent,
  ],
  providers: [
    MessageService,
  ],
  exports: [
    CommonToastsComponent,
  ],
})
export class CommonToastsModule {
}
