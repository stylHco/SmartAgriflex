import {Component, EventEmitter, inject, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DialogModule} from "primeng/dialog";
import {ManageComponentMode} from "../../../../@shared/utils/manage-component-mode.enum";
import {buildManageTileForm} from "./manage-tile.form";
import {TileModelData} from "../tile-model.data";
import {ActivatedRoute} from "@angular/router";
import {ConfDashboardTileType} from "../../../../@core/app-api";
import {ButtonModule} from "primeng/button";
import {FormLossPreventionModule} from "../../../../@shared/form-loss-prevention/form-loss-prevention.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {IdNamespaceModule} from "../../../../@shared/id-namespace/id-namespace.module";
import {TranslocoModule} from "@ngneat/transloco";
import {FormControlErrorsModule} from "../../../../@shared/form-control-errors/form-control-errors.module";
import {InputTextModule} from "primeng/inputtext";
import {
  RequiredFieldIndicatorModule
} from "../../../../@shared/required-field-indicator/required-field-indicator.module";
import {DropdownDefaultsModule} from "../../../../@shared/defaults/dropdown-defaults.module";
import {DropdownModule} from "primeng/dropdown";
import {PredefinedVisTypeSpec, TileTypeSpec} from "../../../../@core/dashboard/translated-enums";
import {TranslatedEnumOptionsPipe} from "../../../../@transloco/translated-enum";

export type ManageTileState = {
  localId?: string,
  data: TileModelData,
};

@Component({
  selector: 'app-dash-manage-tile',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule,
    FormLossPreventionModule,
    FormsModule,
    ReactiveFormsModule,
    IdNamespaceModule,
    TranslocoModule,
    FormControlErrorsModule,
    InputTextModule,
    RequiredFieldIndicatorModule,
    DropdownDefaultsModule,
    DropdownModule,
    TranslatedEnumOptionsPipe,
  ],
  templateUrl: './manage-tile.component.html',
  styleUrls: ['./manage-tile.component.scss'],
})
export class ManageTileComponent {
  protected readonly ManageComponentMode = ManageComponentMode;
  protected readonly TileTypeSpec = TileTypeSpec;
  protected readonly PredefinedVisTypeSpec = PredefinedVisTypeSpec;

  protected readonly activatedRoute = inject(ActivatedRoute);

  protected readonly form = buildManageTileForm();

  protected isVisible = false;
  protected tileId?: string;

  @Output()
  public readonly onConfirmed = new EventEmitter<ManageTileState>();

  protected get mode(): ManageComponentMode {
    return this.tileId ? ManageComponentMode.Edit : ManageComponentMode.Add;
  }

  /**
   * @param state If undefined, assumed to be a new tile
   */
  public show(state?: ManageTileState): void {
    this.form.reset();

    if (state) {
      this._setValuesFromData(state.data);
    }

    this.tileId = state?.localId;
    this.isVisible = true;
  }

  public forceDiscard(): void {
    this.form.reset();
    this.tileId = undefined;
    this.isVisible = false;
  }

  protected onAccept(): void {
    this.onConfirmed.emit({
      localId: this.tileId,
      data: this._buildDataFromCurrentForm(),
    });

    this.forceDiscard();
  }

  /**
   * Assumes `reset()` has been called right before.
   */
  private _setValuesFromData(data: TileModelData): void {
    this.form.patchValue({
      type: data.type,
    });

    switch (data.type) {
      case ConfDashboardTileType.PredefinedVisualization:
        this.form.patchValue({
          predefinedVisOptions: {
            type: data.predefinedVisOptions.type,
          },
        });
        break;
    }
  }

  private _buildDataFromCurrentForm(): TileModelData {
    const value = this.form.getRawValue();

    switch (value.type) {
      case ConfDashboardTileType.DummyText:
        return {
          type: ConfDashboardTileType.DummyText,
        };

      case ConfDashboardTileType.PredefinedVisualization:
        return {
          type: ConfDashboardTileType.PredefinedVisualization,
          predefinedVisOptions: {
            type: value.predefinedVisOptions.type!,
          },
        };
    }

    throw 'Unreachable code - _buildDataFromCurrentForm() should not be called for an invalid form';
  }

  onVisibleChange(newValue: any): void {
    if (newValue === this.isVisible) {
      return;
    }

    if (newValue === false) {
      this.forceDiscard();
      return;
    }

    throw 'Unexpected value emitted from p-dialog';
  }
}
