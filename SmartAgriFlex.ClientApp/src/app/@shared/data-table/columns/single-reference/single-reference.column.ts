import {DynamicComponentBlueprint} from "../../../dynamic-component/dynamic-component.blueprint";
import {ColumnSpec, DT_FIELD_PATH_INPUT, DT_ROW_MODEL_INPUT, getDtFieldValue} from "../../common";
import {SingleReferenceFilterComponent} from "./single-reference-filter.component";
import {
  KEY_PROVIDER_INPUT,
  KeyProvider,
  LABEL_PROVIDER_INPUT,
  LabelProvider,
  ROUTE_PROVIDER_INPUT, RouteCommandsProvider
} from "../reference.shared";
import {ChangeDetectionStrategy, Component, DoCheck, Input} from "@angular/core";
import {CommonModule} from "@angular/common";
import {EmptyReplacerModule} from "../../../display-substitution/empty-replacer";
import {ChangeableValuePipe} from "../../../utils/changeable";
import {RouterLink} from "@angular/router";
import {NullReplacerModule} from "../../../display-substitution/null-replacer";
import {CoerceObservablePipe} from "../../../utils/reactivity-interop";
import {ObjectUtils} from "primeng/utils";

export function buildSingleReferenceColumnOptions<T>(
  fieldPath: string,
  keyProvider: KeyProvider<T>,
  labelProvider: LabelProvider<T>,
  routerCommandsProvider?: RouteCommandsProvider<T>,
): Pick<ColumnSpec, 'globalFilter' | 'columnFilter' | 'cellValue' | 'exportValueFetcher'> {
  const valueFetcher: (row: unknown) => (string | undefined) = row => {
    const fieldData = ObjectUtils.resolveFieldData(row, fieldPath);

    return fieldData
      ? labelProvider(fieldData).value
      : undefined;
  };

  return {
    exportValueFetcher: valueFetcher,
    globalFilter: row => valueFetcher(row) ?? '',
    columnFilter: prepareSingleReferenceColFilterBlueprint<T>(
      fieldPath,
      keyProvider,
      labelProvider,
    ),
    cellValue: prepareSingleReferenceCellValueBlueprint<T>(
      fieldPath,
      labelProvider,
      routerCommandsProvider,
    ),
  };
}

export function prepareSingleReferenceCellValueBlueprint<T>(
  fieldPath: string,
  labelProvider: LabelProvider<T>,
  routerCommandsProvider?: RouteCommandsProvider<T>,
): DynamicComponentBlueprint<SingleReferenceCellValueComponent<T>> {
  return {
    componentType: SingleReferenceCellValueComponent,
    initSetInputs: {
      [DT_FIELD_PATH_INPUT]: fieldPath,
      [LABEL_PROVIDER_INPUT]: labelProvider,
      [ROUTE_PROVIDER_INPUT]: routerCommandsProvider,
    },
  };
}

@Component({
  standalone: true,
  imports: [
    CommonModule,
    EmptyReplacerModule,
    ChangeableValuePipe,
    RouterLink,
    NullReplacerModule,
    CoerceObservablePipe,
  ],
  template: `
    <ng-container *appNullReplacer="cellValue">
      <ng-container *ngIf="cellValue">
        <a
          *ngIf="routerCommandsProvider; else: withoutLink"
          [routerLink]="routerCommandsProvider(cellValue) | appCoerce$ | async"
        >
          <ng-container [ngTemplateOutlet]="label" />
        </a>

        <ng-template #withoutLink>
          <ng-container [ngTemplateOutlet]="label" />
        </ng-template>

        <!--suppress TypeScriptValidateTypes -->
        <ng-template #label>
          {{ labelProvider?.(cellValue) | changeableValue }}
        </ng-template>
      </ng-container>
    </ng-container>
  `,
  styles: [':host {display: contents}'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SingleReferenceCellValueComponent<TValue> implements DoCheck {
  @Input(DT_FIELD_PATH_INPUT)
  public fieldPath?: string;

  @Input(LABEL_PROVIDER_INPUT)
  public labelProvider?: LabelProvider<TValue>;

  @Input(ROUTE_PROVIDER_INPUT)
  public routerCommandsProvider?: RouteCommandsProvider<TValue>;

  @Input(DT_ROW_MODEL_INPUT)
  rowData?: any;

  protected cellValue?: TValue;

  ngDoCheck(): void {
    if (!this.fieldPath) {
      this.cellValue = undefined;
      return;
    }

    this.cellValue = getDtFieldValue(this.rowData, this.fieldPath);
  }
}

export function prepareSingleReferenceColFilterBlueprint<T>(
  fieldPath: string,
  keyProvider: KeyProvider<T>,
  labelProvider: LabelProvider<T>,
): DynamicComponentBlueprint<SingleReferenceFilterComponent> {
  return {
    componentType: SingleReferenceFilterComponent,
    initSetInputs: {
      [DT_FIELD_PATH_INPUT]: fieldPath,

      [KEY_PROVIDER_INPUT]: keyProvider,
      [LABEL_PROVIDER_INPUT]: labelProvider,
    },
  };
}
