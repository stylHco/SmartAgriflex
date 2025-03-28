import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DetailsListEntryComponent} from './entry/details-list-entry.component';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    DetailsListEntryComponent,
  ],
  exports: [
    DetailsListEntryComponent,
  ]
})
export class DetailsListModule {
}
