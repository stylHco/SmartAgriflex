import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input} from '@angular/core';
import {finalize} from "rxjs";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {RouterModule} from "@angular/router";
import {TranslocoModule} from "@ngneat/transloco";
import {ButtonModule} from "primeng/button";
import {DeletionConfirmDialogModule} from "../../../deletion-confirm-dialog/deletion-confirm-dialog.module";
import {COMMON_ACTIONS_CONTEXT, CommonActionsContext} from "./common-actions.column";
import {CrudHelpersService} from "../../../utils/crud-helpers.service";
import {DT_ROW_MODEL_INPUT} from "../../common";
import {DataTableComponent} from "../../data-table.component";
import {autoMarkForCheck} from "../../../utils/change-detection-helpers";
import {Changeable, changeableFromConstValue, isChangeable} from "../../../utils/changeable";
import {CoerceObservablePipe} from "../../../utils/reactivity-interop";
import {CommonModule} from "@angular/common";

@UntilDestroy()
@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslocoModule,
    ButtonModule,
    DeletionConfirmDialogModule,
    CoerceObservablePipe,
  ],
  templateUrl: './common-actions-cell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommonActionsCellComponent {
  @Input(DT_ROW_MODEL_INPUT)
  rowModel?: any;

  isDeleteConfirmOpen = false;
  isDeleting = false; // TODO: convert to SubscriptionsCounter

  constructor(
    private readonly dataTable: DataTableComponent,
    @Inject(COMMON_ACTIONS_CONTEXT) private readonly actionsContext: CommonActionsContext,
    private readonly crudHelpers: CrudHelpersService,
    private readonly cd: ChangeDetectorRef,
  ) {
  }

  get viewLink(): any[] | string {
    return this.actionsContext.getViewLinkCommands(this.rowModel);
  }

  get editLink(): any[] | string {
    return this.actionsContext.getEditLinkCommands(this.rowModel);
  }

  get itemNameForDelete(): Changeable<string> {
    const maybeChangeable = this.actionsContext.getItemNameForDelete(this.rowModel);

    if (isChangeable(maybeChangeable)) {
      return maybeChangeable;
    }

    return changeableFromConstValue(maybeChangeable);
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
