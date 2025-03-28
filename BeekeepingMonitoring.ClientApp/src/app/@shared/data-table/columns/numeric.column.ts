import {ChangeDetectionStrategy, Component, DoCheck, Input} from "@angular/core";
import {ColumnSpec, DT_FIELD_PATH_INPUT, DT_ROW_MODEL_INPUT, getDtFieldValue} from "../common";
import {DynamicComponentBlueprint} from "../../dynamic-component/dynamic-component.blueprint";
import {CommonModule} from "@angular/common";
import {TableModule} from "primeng/table";
import {NullReplacerModule} from "../../display-substitution/null-replacer";
import {RefreshOnTableResetDirective} from "../refresh-on-table-reset.directive";

export function buildNumericColumnOptions(fieldPath: string): Partial<ColumnSpec> {
  return {
    globalFilter: fieldPath,
    columnFilter: prepareNumericColFilterBlueprint(fieldPath),
    sortField: fieldPath,
    cellValue: prepareNumericCellValueBlueprint(fieldPath),
  };
}

export function prepareNumericCellValueBlueprint(
  fieldPath: string,
  digitsInfo?: string,
): DynamicComponentBlueprint<NumericCellValueComponent> {
  return {
    componentType: NumericCellValueComponent,
    initSetInputs: {
      [DT_FIELD_PATH_INPUT]: fieldPath,
      [DIGITS_INFO_INPUT]: digitsInfo ?? '1.0-99',
    },
  };
}

export const DIGITS_INFO_INPUT = 'digitsInfo';

@Component({
  standalone: true,
  imports: [CommonModule, NullReplacerModule],
  template: `
    <ng-container *ngIf="fieldPath">
      <ng-container *appNullReplacer="cellValue">
        {{ cellValue | number: digitsInfo }}
      </ng-container>
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumericCellValueComponent implements DoCheck {
  @Input(DT_FIELD_PATH_INPUT)
  public fieldPath?: string;

  @Input(DIGITS_INFO_INPUT)
  public digitsInfo?: string;

  @Input(DT_ROW_MODEL_INPUT)
  rowData?: any;

  cellValue?: any;

  ngDoCheck(): void {
    if (!this.fieldPath) {
      this.cellValue = undefined;
      return;
    }

    this.cellValue = getDtFieldValue(this.rowData, this.fieldPath);
  }
}

export function prepareNumericColFilterBlueprint(
  fieldPath: string,
): DynamicComponentBlueprint<NumericColFilterComponent> {
  return {
    componentType: NumericColFilterComponent,
    initSetInputs: {
      [DT_FIELD_PATH_INPUT]: fieldPath,
    },
  };
}

@Component({
  standalone: true,
  imports: [TableModule, RefreshOnTableResetDirective],
  template: `
    <p-columnFilter type="numeric" [field]="fieldPath ?? ''" display="menu" dtRefreshOnTableReset/>
  `,
  styles: [':host {display: contents}'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumericColFilterComponent {
  @Input(DT_FIELD_PATH_INPUT)
  public fieldPath?: string;
}

