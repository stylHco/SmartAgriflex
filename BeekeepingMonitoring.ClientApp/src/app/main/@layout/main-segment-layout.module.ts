import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MainSegmentLayoutComponent} from './main-segment-layout.component';
import {RouterModule} from "@angular/router";
import {MainSegmentHeaderComponent} from './header/header.component';
import {MainSegmentFooterComponent} from './footer/footer.component';
import {SharedModule} from "primeng/api";
import {LangSelectorComponent} from './header/lang-selector.component';
import {ListboxModule} from "primeng/listbox";
import {FormsModule} from "@angular/forms";
import {OverlayPanelModule} from "primeng/overlaypanel";
import {ButtonModule} from "primeng/button";
import {ThemeSelectorComponent} from "./header/theme-selector.component";
import {ClicksInsideRetainMobileMenuDirective} from "./clicks-inside-retain-mobile-menu.directive";

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([]),
    SharedModule,
    ListboxModule,
    FormsModule,
    OverlayPanelModule,
    ButtonModule,
  ],
  declarations: [
    MainSegmentLayoutComponent,
    MainSegmentHeaderComponent,
    MainSegmentFooterComponent,
    LangSelectorComponent,
    ThemeSelectorComponent,
    ClicksInsideRetainMobileMenuDirective,
  ],
  exports: [
    MainSegmentLayoutComponent,
  ]
})
export class MainSegmentLayoutModule {
}
