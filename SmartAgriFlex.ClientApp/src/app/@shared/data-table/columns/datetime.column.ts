import {ChangeDetectionStrategy, Component, Input} from "@angular/core";
import {ColumnSpec, DT_FIELD_PATH_INPUT, DT_ROW_MODEL_INPUT, getDtFieldValue} from "../common";
import {DynamicComponentBlueprint} from "../../dynamic-component/dynamic-component.blueprint";
import {CommonModule} from "@angular/common";
import {TableModule} from "primeng/table";
import {NullReplacerModule} from "../../display-substitution/null-replacer";
import {DateTimeDisplayModule} from "../../date-time/date-time-display";
import {RefreshOnTableResetDirective} from "../refresh-on-table-reset.directive";

export function buildDateTimeColumnOptions(fieldPath: string): Partial<ColumnSpec> {
  return {
    columnFilter: prepareDateTimeColFilterBlueprint(fieldPath),
    sortField: fieldPath,
    cellValue: prepareDateTimeCellValueBlueprint(fieldPath),

    exportValueFetcher: rowModel => {
      const value = getDtFieldValue(rowModel, fieldPath);

      if (value instanceof Date) return value.toISOString();

      return value;
    },
  };
}

export function prepareDateTimeCellValueBlueprint(
  fieldPath: string,
): DynamicComponentBlueprint<DateTimeCellValueComponent> {
  return {
    componentType: DateTimeCellValueComponent,
    initSetInputs: {
      [DT_FIELD_PATH_INPUT]: fieldPath,
    },
  };
}

@Component({
  standalone: true,
  imports: [CommonModule, NullReplacerModule, DateTimeDisplayModule],
  template: `
    <ng-container *ngIf="fieldPath">
      <ng-container *appNullReplacer="cellValue">
        <app-date-time-display [value]="cellValue" />
      </ng-container>
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateTimeCellValueComponent {
  @Input(DT_FIELD_PATH_INPUT)
  public fieldPath?: string;

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

export function prepareDateTimeColFilterBlueprint(
  fieldPath: string,
): DynamicComponentBlueprint<DateTimeColFilterComponent> {
  return {
    componentType: DateTimeColFilterComponent,
    initSetInputs: {
      [DT_FIELD_PATH_INPUT]: fieldPath,
    },
  };
}

@Component({
  standalone: true,
  imports: [TableModule, RefreshOnTableResetDirective],
  template: `
    <p-columnFilter type="date" [field]="fieldPath ?? ''" display="menu" dtRefreshOnTableReset/>
  `,
  styles: [':host {display: contents}'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateTimeColFilterComponent {
  @Input(DT_FIELD_PATH_INPUT)
  public fieldPath?: string;
}
