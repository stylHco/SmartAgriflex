import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NotFoundComponent} from "./not-found/not-found.component";
import {ButtonModule} from "primeng/button";
import {RouterModule} from "@angular/router";
import {InternalErrorComponent} from './internal-error/internal-error.component';
import {NotFoundSilentRedirectComponent} from "./not-found-silent-redirect.component";

@NgModule({
  imports: [
    CommonModule,
    ButtonModule,
    RouterModule.forChild([]),
  ],
  declarations: [
    NotFoundComponent,
    InternalErrorComponent,
    NotFoundSilentRedirectComponent,
  ],
})
export class MiscModule {
}
