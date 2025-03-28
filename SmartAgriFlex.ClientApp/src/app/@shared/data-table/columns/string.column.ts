import {ChangeDetectionStrategy, Component, Input} from "@angular/core";
import {ColumnSpec, DT_FIELD_PATH_INPUT, DT_ROW_MODEL_INPUT, getDtFieldValue} from "../common";
import {DynamicComponentBlueprint} from "../../dynamic-component/dynamic-component.blueprint";
import {CommonModule} from "@angular/common";
import {TableModule} from "primeng/table";
import {MultiLineTextComponent} from "../../utils/multi-line-text.component";
import {NgLetDirective} from "../../utils/ng-let.directive";
import {NullReplacerModule} from "../../display-substitution/null-replacer";
import {EmptyReplacerModule} from "../../display-substitution/empty-replacer";
import {RefreshOnTableResetDirective} from "../refresh-on-table-reset.directive";

export function buildStringColumnOptions(fieldPath: string): Partial<ColumnSpec> {
  return {
    globalFilter: fieldPath,
    columnFilter: prepareStringColFilterBlueprint(fieldPath),
    sortField: fieldPath,
    cellValue: prepareStringCellValueBlueprint(fieldPath),
  };
}

export function prepareStringCellValueBlueprint(
  fieldPath: string,
): DynamicComponentBlueprint<StringCellValueComponent> {
  return {
    componentType: StringCellValueComponent,
    initSetInputs: {
      [DT_FIELD_PATH_INPUT]: fieldPath,
    },
  };
}

@Component({
  standalone: true,
  imports: [
    CommonModule,
    NgLetDirective,
    NullReplacerModule,
    EmptyReplacerModule,
  ],
  template: `
    <ng-container *ngIf="fieldPath">
      <ng-container *ngLet="getDtFieldValue(rowData, fieldPath) as value">
        <ng-container *appNullReplacer="value">
          <ng-container *appEmptyReplacer="value">
            {{ value }}
          </ng-container>
        </ng-container>
      </ng-container>
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StringCellValueComponent {
  readonly getDtFieldValue = getDtFieldValue;

  @Input(DT_FIELD_PATH_INPUT)
  public fieldPath?: string;

  @Input(DT_ROW_MODEL_INPUT)
  rowData?: any;
}

export function buildMultiLineStringColumnOptions(fieldPath: string): Partial<ColumnSpec> {
  return {
    globalFilter: fieldPath,
    columnFilter: prepareStringColFilterBlueprint(fieldPath),
    sortField: fieldPath,
    cellValue: prepareMultiLineStringCellValueBlueprint(fieldPath),
  };
}

export function prepareMultiLineStringCellValueBlueprint(
  fieldPath: string,
): DynamicComponentBlueprint<StringCellValueComponent> {
  return {
    componentType: MultiLineStringCellValueComponent,
    initSetInputs: {
      [DT_FIELD_PATH_INPUT]: fieldPath,
    },
  };
}

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MultiLineTextComponent,
    NgLetDirective,
    NullReplacerModule,
    EmptyReplacerModule,
  ],
  template: `
    <ng-container *ngIf="fieldPath">
      <ng-container *ngLet="getDtFieldValue(rowData, fieldPath) as value">
        <ng-container *appNullReplacer="value">
          <ng-container *appEmptyReplacer="value">
            <app-multi-line-text [text]="value" />
          </ng-container>
        </ng-container>
      </ng-container>
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiLineStringCellValueComponent {
  readonly getDtFieldValue = getDtFieldValue;

  @Input(DT_FIELD_PATH_INPUT)
  public fieldPath?: string;

  @Input(DT_ROW_MODEL_INPUT)
  rowData?: any;
}

export function prepareStringColFilterBlueprint(
  fieldPath: string,
): DynamicComponentBlueprint<StringColFilterComponent> {
  return {
    componentType: StringColFilterComponent,
    initSetInputs: {
      [DT_FIELD_PATH_INPUT]: fieldPath,
    },
  };
}

@Component({
  standalone: true,
  imports: [TableModule, RefreshOnTableResetDirective],
  template: `
    <p-columnFilter type="text" [field]="fieldPath ?? ''" display="menu" dtRefreshOnTableReset/>
  `,
  styles: [':host {display: contents}'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StringColFilterComponent {
  @Input(DT_FIELD_PATH_INPUT)
  public fieldPath?: string;
}
