import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DeletionConfirmDialogComponent} from './deletion-confirm-dialog.component';
import {DialogModule} from "primeng/dialog";
import {ButtonModule} from "primeng/button";
import {TranslocoModule} from "@ngneat/transloco";

@NgModule({
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule,
    TranslocoModule,
  ],
  declarations: [
    DeletionConfirmDialogComponent,
  ],
  exports: [
    DeletionConfirmDialogComponent,
  ],
})
export class DeletionConfirmDialogModule {
}
