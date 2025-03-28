import {InjectionToken, QueryList} from "@angular/core";
import {NamedTemplateDirective} from "../utils/named-template";
import {DynamicComponentBlueprint} from "../dynamic-component/dynamic-component.blueprint";
import {ObjectUtils} from "primeng/utils";
import {NgClass, NgStyle} from "@angular/common";
import {Observable} from "rxjs";

export type GlobalFilterValueProvider = (row: unknown) => string;

export type ColumnSpec = Readonly<{
  header?: DynamicComponentBlueprint<any>;

  /**
   * If string, assumed to be field path.
   * If function, will be called with the row object to derive the filterable value.
   *
   * In either case, the filterable value must be a string.
   *
   * https://github.com/primefaces/primeng/blob/ecce4d87e729054430e4300e7128cf4d07452db8/src/app/components/table/table.ts#L1608-L1615
   * https://github.com/primefaces/primeng/blob/ecce4d87e729054430e4300e7128cf4d07452db8/src/app/components/utils/objectutils.ts#L54-L78
   */
  globalFilter?: string | GlobalFilterValueProvider;

  /**
   * Expected to be a component with a single `<p-columnFilter/>` and `:host {display: contents}`
   */
  columnFilter?: DynamicComponentBlueprint<any, DtFilterInputs>;

  /**
   * The field path to get the sort value for this column.
   * If not set, this column will not be sortable.
   */
  sortField?: string;

  cellValue?: DynamicComponentBlueprint<any, DtCellInputs>;

  headerClass?: Observable<NgClass['ngClass']>;
  headerStyle?: Observable<NgStyle['ngStyle']>;

  cellClass?: (rowModel: unknown) => Observable<NgClass['ngClass']>;
  cellStyle?: (rowModel: unknown) => Observable<NgStyle['ngStyle']>;

  excludeFromExport?: boolean;

  exportValueFetcher?: (rowModel: unknown) => unknown;
}>;

export const DT_TEMPLATES_PROVIDER = new InjectionToken<DataTableTemplatesProvider>('DT_TEMPLATES_PROVIDER');

export interface DataTableTemplatesProvider {
  get templates(): QueryList<NamedTemplateDirective>
}

/**
 * DT will automatically set this on cell components (assuming the component has such an input)
 */
export const DT_ROW_MODEL_INPUT = '__DATA_TABLE_ROW_MODEL';

/**
 * DT will automatically set this on all components (assuming the component has such an input)
 */
export const DT_ALL_MODEL_INPUT = '__DATA_TABLE_ALL_MODEL';

/**
 * Not actually used by the DT infrastructure, but used commonly by various column components
 */
export const DT_FIELD_PATH_INPUT = '__DATA_TABLE_FIELD_PATH';

export type DtCellInputs = {
  [DT_ROW_MODEL_INPUT]: unknown,
  [DT_ALL_MODEL_INPUT]: unknown[],
};

export type DtFilterInputs = {
  [DT_ALL_MODEL_INPUT]: unknown[],
};

export function getDtFieldValue(rowData: unknown, path: string): any {
  // Just forward to PrimeNG's implementation
  return ObjectUtils.resolveFieldData(rowData, path);
}
