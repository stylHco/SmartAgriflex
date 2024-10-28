import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {COMMON_ACTIONS_CONTEXT} from "./common-actions.column";
import {DT_ROW_MODEL_INPUT} from "../../common";
import {ButtonModule} from "primeng/button";
import {CoerceObservablePipe} from "../../../utils/reactivity-interop";
import {DeletionConfirmDialogModule} from "../../../deletion-confirm-dialog/deletion-confirm-dialog.module";
import {Changeable, changeableFromConstValue, isChangeable} from "../../../utils/changeable";
import {autoMarkForCheck} from "../../../utils/change-detection-helpers";
import {finalize} from "rxjs";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {CrudHelpersService} from "../../../utils/crud-helpers.service";
import {DataTableComponent} from "../../data-table.component";
import {TranslocoModule} from "@ngneat/transloco";

@UntilDestroy()
@Component({
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CoerceObservablePipe,
    DeletionConfirmDialogModule,
    TranslocoModule,
  ],
  template: `
    <button pButton class="p-button-text p-button-icon-only" icon="pi pi-trash"
            (click)="isDeleteConfirmOpen = true" [title]="'buttons.delete' | transloco">
    </button>

    <app-deletion-confirm-dialog
      [(isOpen)]="isDeleteConfirmOpen"
      [itemDeletedName]="(itemNameForDelete | appCoerce$ | async) ?? ''"
      [isDraft]="isDraft"
      (accepted)="deleteConfirmed()" [inProgress]="isDeleting"/>
  `,
  styles: [':host {display: contents}'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteButtonComponent {
  private readonly actionsContext = inject(COMMON_ACTIONS_CONTEXT);
  private readonly crudHelpers = inject(CrudHelpersService);
  private readonly cd = inject(ChangeDetectorRef);

  private readonly dataTable = inject(DataTableComponent);

  @Input(DT_ROW_MODEL_INPUT)
  rowModel?: any;

  isDeleteConfirmOpen = false;
  isDeleting = false; // TODO: convert to SubscriptionsCounter

  get itemNameForDelete(): Changeable<string> {
    const maybeChangeable = this.actionsContext.getItemNameForDelete(this.rowModel);

    if (isChangeable(maybeChangeable)) {
      return maybeChangeable;
    }

    return changeableFromConstValue(maybeChangeable);
  }

  protected get isDraft(): boolean {
    return this.actionsContext.deleteIsDraft?.(this.rowModel) ?? false;
  }

  deleteConfirmed(): void {
    this.isDeleting = true;

    this.actionsContext.prepareDelete(this.rowModel)
      .pipe(
        autoMarkForCheck(this.cd),
        this.crudHelpers.handleDelete(this.itemNameForDelete.value),
        finalize(() => this.isDeleting = false),
        untilDestroyed(this),
      )
      .subscribe(() => {
        this.isDeleting = false;

        // Note: this will cause us to be destroyed during the next CD pass
        this.dataTable.rowModels = this.dataTable.rowModels.filter(item => item !== this.rowModel);

        // Inform the DT containing component that the list of rows was changed
        this.dataTable.rowModelsChange.emit(this.dataTable.rowModels);
      });
  }
}
