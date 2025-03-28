import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AccountGeneralComponent} from './account-general.component';
import {PanelModule} from "primeng/panel";

@NgModule({
  imports: [
    CommonModule,
    PanelModule,
  ],
  declarations: [
    AccountGeneralComponent,
  ]
})
export class AccountGeneralModule {
}
