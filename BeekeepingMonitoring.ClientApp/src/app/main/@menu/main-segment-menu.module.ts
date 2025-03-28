import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MainSegmentMenuComponent} from "./main-segment-menu.component";
import {MenuItemComponent} from "./menu-item/menu-item.component";
import {RouterModule} from "@angular/router";


@NgModule({
  declarations: [
    MainSegmentMenuComponent,
    MenuItemComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
  ],
  exports: [
    MainSegmentMenuComponent,
  ]
})
export class MainSegmentMenuModule {
}
