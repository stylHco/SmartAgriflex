import {ChangeDetectionStrategy, Component, Input} from "@angular/core";
import {ColumnSpec, DT_FIELD_PATH_INPUT, DT_ROW_MODEL_INPUT, getDtFieldValue} from "../common";
import {DynamicComponentBlueprint} from "../../dynamic-component/dynamic-component.blueprint";
import {CommonModule} from "@angular/common";
import {NullReplacerModule} from "../../display-substitution/null-replacer";
import {DateTimeDisplayModule} from "../../date-time/date-time-display";
import {prepareDateTimeColFilterBlueprint} from "./datetime.column";
import {DateTimeFormatter, LocalDate} from "@js-joda/core";

export function buildLocalDateColumnOptions(fieldPath: string): Partial<ColumnSpec> {
  return {
    cellValue: prepareLocalDateCellValueBlueprint(fieldPath),
    sortField: fieldPath,

    // Same UI
    columnFilter: prepareDateTimeColFilterBlueprint(fieldPath),

    exportValueFetcher: rowModel => {
      const value = getDtFieldValue(rowModel, fieldPath);

      if (value instanceof LocalDate) return value.format(DateTimeFormatter.ISO_LOCAL_DATE);

      return value;
    },
  };
}

export function prepareLocalDateCellValueBlueprint(
  fieldPath: string,
): DynamicComponentBlueprint<LocalDateCellValueComponent> {
  return {
    componentType: LocalDateCellValueComponent,
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
        <app-date-display [value]="cellValue"/>
      </ng-container>
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocalDateCellValueComponent {
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
