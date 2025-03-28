import {DynamicComponentBlueprint} from "../../../dynamic-component/dynamic-component.blueprint";
import {ColumnSpec, DT_FIELD_PATH_INPUT, DT_ROW_MODEL_INPUT, getDtFieldValue} from "../../common";
import {MultipleReferencesFilterComponent} from "./multiple-references-filter.component";
import {
  KEY_PROVIDER_INPUT,
  KeyProvider,
  LABEL_PROVIDER_INPUT,
  LabelProvider,
  ROUTE_PROVIDER_INPUT, RouteCommandsProvider
} from "../reference.shared";
import {ChangeDetectionStrategy, Component, DoCheck, Input} from "@angular/core";
import {EmptyReplacerModule} from "../../../display-substitution/empty-replacer";
import {ChipsListComponent} from "../../../chips-list/chips-list.component";
import {TemplateTypeWitnessModule} from "../../../utils/template-type-witness";
import {CommonModule} from "@angular/common";
import {ChangeableValuePipe} from "../../../utils/changeable";

export function buildMultipleReferencesColumnOptions<T>(
  fieldPath: string,
  keyProvider: KeyProvider<T>,
  labelProvider: LabelProvider<T>,
  routerCommandsProvider: RouteCommandsProvider<T>,
  displayLimit?: number,
): Partial<ColumnSpec> {
  return {
    columnFilter: prepareMultipleReferencesColFilterBlueprint<T>(
      fieldPath,
      keyProvider,
      labelProvider,
    ),
    cellValue: prepareMultipleReferencesCellValueBlueprint<T>(
      fieldPath,
      labelProvider,
      routerCommandsProvider,
      displayLimit,
    ),
  };
}

export function prepareMultipleReferencesCellValueBlueprint<T>(
  fieldPath: string,
  labelProvider: LabelProvider<T>,
  routerCommandsProvider: RouteCommandsProvider<T>,
  displayLimit?: number,
): DynamicComponentBlueprint<MultipleReferencesCellValueComponent<T>> {
  const displayLimitInputs = displayLimit
    ? {[DISPLAY_LIMIT_INPUT]: displayLimit}
    : {};

  return {
    componentType: MultipleReferencesCellValueComponent,
    initSetInputs: {
      [DT_FIELD_PATH_INPUT]: fieldPath,
      [LABEL_PROVIDER_INPUT]: labelProvider,
      [ROUTE_PROVIDER_INPUT]: routerCommandsProvider,

      ...displayLimitInputs,
    },
  };
}

export const DISPLAY_LIMIT_INPUT = 'displayLimit';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    EmptyReplacerModule,
    ChipsListComponent,
    TemplateTypeWitnessModule,
    ChangeableValuePipe,
  ],
  template: `
    <ng-container *ngIf="cellValue">
      <ng-container *appEmptyReplacer="cellValue">
        <app-chips-list
          [items]="cellValue"
          [displayLimit]="displayLimit"
          [labelTemplate]="label"
          [routerCommandsProvider]="routerCommandsProvider!"/>

        <ng-template #label let-entry [appWitnessIterable]="cellValue">
          {{ labelProvider?.(entry) | changeableValue }}
        </ng-template>
      </ng-container>
    </ng-container>
  `,
  styles: [':host {display: contents}'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultipleReferencesCellValueComponent<TEntry> implements DoCheck {
  @Input(DT_FIELD_PATH_INPUT)
  public fieldPath?: string;

  @Input(DISPLAY_LIMIT_INPUT)
  public displayLimit: number = 3;

  @Input(LABEL_PROVIDER_INPUT)
  public labelProvider?: LabelProvider<TEntry>;

  @Input(ROUTE_PROVIDER_INPUT)
  public routerCommandsProvider?: RouteCommandsProvider<TEntry>;

  @Input(DT_ROW_MODEL_INPUT)
  rowData?: any;

  protected cellValue?: TEntry[];

  ngDoCheck(): void {
    if (!this.fieldPath) {
      this.cellValue = undefined;
      return;
    }

    this.cellValue = getDtFieldValue(this.rowData, this.fieldPath);
  }
}

export function prepareMultipleReferencesColFilterBlueprint<T>(
  fieldPath: string,
  keyProvider: KeyProvider<T>,
  labelProvider: LabelProvider<T>,
): DynamicComponentBlueprint<MultipleReferencesFilterComponent> {
  return {
    componentType: MultipleReferencesFilterComponent,
    initSetInputs: {
      [DT_FIELD_PATH_INPUT]: fieldPath,

      [KEY_PROVIDER_INPUT]: keyProvider,
      [LABEL_PROVIDER_INPUT]: labelProvider,
    },
  };
}
