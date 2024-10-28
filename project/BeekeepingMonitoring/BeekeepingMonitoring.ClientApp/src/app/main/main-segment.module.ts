import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {MainSegmentRoutingModule} from './main-segment-routing.module';
import {MainSegmentComponent} from './main-segment.component';
import {MainSegmentLayoutModule} from "./@layout/main-segment-layout.module";
import {MainSegmentMenuModule} from "./@menu/main-segment-menu.module";


@NgModule({
  declarations: [
    MainSegmentComponent,
  ],
  imports: [
    CommonModule,
    MainSegmentRoutingModule,
    MainSegmentLayoutModule,
    MainSegmentMenuModule,
  ]
})
export class MainSegmentModule {
}
