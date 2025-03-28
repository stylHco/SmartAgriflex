import {DynamicComponentBlueprint} from "../../dynamic-component/dynamic-component.blueprint";
import {ColumnSpec, DT_FIELD_PATH_INPUT, DT_ROW_MODEL_INPUT, getDtFieldValue} from "../common";
import {ChangeDetectionStrategy, Component, Input} from "@angular/core";
import {CommonModule} from "@angular/common";
import {NullReplacerModule} from "../../display-substitution/null-replacer";
import {EnumLabels} from "../../utils/enum-utils";

export function buildEnumColumnOptions(
  fieldPath: string,
  labels: EnumLabels<any>,
): Pick<ColumnSpec, 'cellValue'> {
  return {
    cellValue: prepareEnumCellValueBlueprint(fieldPath, labels),

    // TODO: filter and sort
  };
}

export function prepareEnumCellValueBlueprint(
  fieldPath: string,
  labels: EnumLabels<any>,
): DynamicComponentBlueprint<EnumCellValueComponent> {
  return {
    componentType: EnumCellValueComponent,
    initSetInputs: {
      [DT_FIELD_PATH_INPUT]: fieldPath,
      [LABELS_INPUT]: labels,
    },
  };
}

export const LABELS_INPUT = 'labels';

@Component({
  standalone: true,
  imports: [CommonModule, NullReplacerModule],
  template: `
      <ng-container *ngIf="fieldPath">
          <ng-container *appNullReplacer="cellValue">
              {{ label }}
          </ng-container>
      </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnumCellValueComponent {
  @Input(DT_FIELD_PATH_INPUT)
  public fieldPath?: string;

  @Input(LABELS_INPUT)
  public labels?: EnumLabels<any>;

  @Input(DT_ROW_MODEL_INPUT)
  public rowData?: any;

  protected cellValue?: any;

  ngDoCheck(): void {
    if (!this.fieldPath) {
      this.cellValue = undefined;
      return;
    }

    this.cellValue = getDtFieldValue(this.rowData, this.fieldPath);
  }

  protected get label(): string | undefined {
    if (!this.labels) return undefined;
    if (!this.cellValue) return undefined;

    return this.labels[this.cellValue];
  }
}
