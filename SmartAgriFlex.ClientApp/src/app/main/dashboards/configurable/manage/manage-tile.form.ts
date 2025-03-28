import {FormControl, FormGroup} from "@angular/forms";
import {ConfDashboardTileType, PredefinedVisualizationType} from "../../../../@core/app-api";
import {CommonValidators} from "../../../../@shared/utils/common-validators";
import {enableControlWhileAnother} from "../../../../@shared/utils/form-helpers";

export interface ManageTileForm {
  type: FormControl<ConfDashboardTileType | null>;

  predefinedVisOptions: FormGroup<PredefinedVisOptionsForm>;
}

export interface PredefinedVisOptionsForm {
  // name: FormControl<string>;
  type: FormControl<PredefinedVisualizationType | null>;
}

export function buildManageTileForm(): FormGroup<ManageTileForm> {
  const formGroup = new FormGroup<ManageTileForm>({
    type: new FormControl<ConfDashboardTileType | null>(null, {
      validators: [
        CommonValidators.required(),
      ],
    }),

    predefinedVisOptions: new FormGroup<PredefinedVisOptionsForm>({
      type: new FormControl<PredefinedVisualizationType | null>(null, {
        validators: [
          CommonValidators.required(),
        ],
      }),
    }),
  });

  enableControlWhileAnother(
    formGroup.controls.predefinedVisOptions, formGroup.controls.type,
    type => type === ConfDashboardTileType.PredefinedVisualization,
  );

  return formGroup;
}
