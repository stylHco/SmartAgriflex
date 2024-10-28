import {ChangeDetectionStrategy, Component, Input} from "@angular/core";
import {ColumnSpec, DT_FIELD_PATH_INPUT, DT_ROW_MODEL_INPUT, getDtFieldValue} from "../common";
import {DynamicComponentBlueprint} from "../../dynamic-component/dynamic-component.blueprint";
import {CommonModule} from "@angular/common";
import {TableModule} from "primeng/table";
import {NullReplacerModule} from "../../display-substitution/null-replacer";
import {BoolYesNoComponent} from "../../utils/bool-yes-no";
import {RefreshOnTableResetDirective} from "../refresh-on-table-reset.directive";

export function buildBooleanColumnOptions(fieldPath: string): Partial<ColumnSpec> {
  return {
    columnFilter: prepareBooleanColFilterBlueprint(fieldPath),
    sortField: fieldPath,
    cellValue: prepareBooleanCellValueBlueprint(fieldPath),
  };
}

export function prepareBooleanCellValueBlueprint(
  fieldPath: string,
): DynamicComponentBlueprint<BooleanCellValueComponent> {
  return {
    componentType: BooleanCellValueComponent,
    initSetInputs: {
      [DT_FIELD_PATH_INPUT]: fieldPath,
    },
  };
}

@Component({
  standalone: true,
  imports: [CommonModule, NullReplacerModule, BoolYesNoComponent],
  template: `
    <ng-container *ngIf="fieldPath">
      <ng-container *appNullReplacer="cellValue">
        <app-bool-yes-no [value]="cellValue"/>
      </ng-container>
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BooleanCellValueComponent {
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

export function prepareBooleanColFilterBlueprint(
  fieldPath: string,
): DynamicComponentBlueprint<BooleanColFilterComponent> {
  return {
    componentType: BooleanColFilterComponent,
    initSetInputs: {
      [DT_FIELD_PATH_INPUT]: fieldPath,
    },
  };
}

@Component({
  standalone: true,
  imports: [TableModule, RefreshOnTableResetDirective],
  template: `
    <p-columnFilter type="boolean" [field]="fieldPath ?? ''" display="menu" dtRefreshOnTableReset/>
  `,
  styles: [':host {display: contents}'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BooleanColFilterComponent {
  @Input(DT_FIELD_PATH_INPUT)
  public fieldPath?: string;
}
