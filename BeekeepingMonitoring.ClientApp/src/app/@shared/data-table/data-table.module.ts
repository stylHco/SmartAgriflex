import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DataTableComponent} from "./data-table.component";
import {DynamicComponentOutletDirective} from "../dynamic-component/dynamic-component-outlet.directive";
import {TableModule} from "primeng/table";
import {TableGlobalFilterModule} from "../utils/table-global-filter";
import {FormsModule} from "@angular/forms";
import {InputTextModule} from "primeng/inputtext";
import {ButtonModule} from "primeng/button";
import {UnwrapRowModelCallbackPipe} from "./unwrap-row-model-callback.pipe";

@NgModule({
  declarations: [
    DataTableComponent,
    UnwrapRowModelCallbackPipe,
  ],
    imports: [
    CommonModule,
    DynamicComponentOutletDirective,
    TableModule,
    TableGlobalFilterModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    ],
  exports: [
    DataTableComponent,
  ],
})
export class DataTableModule {
}
