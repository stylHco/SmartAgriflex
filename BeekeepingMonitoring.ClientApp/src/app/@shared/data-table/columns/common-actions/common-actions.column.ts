import {ColumnSpec} from "../../common";
import {Observable, of} from "rxjs";
import {InjectionToken} from "@angular/core";
import {Changeable} from "../../../utils/changeable";
import {
  MultipleComponentsCellComponent,
  prepareMultipleComponentsCell
} from "../../common-components/multiple-components-cell.component";
import {DetailsLinkComponent} from "./details-link.component";
import {EditLinkComponent} from "./edit-link.component";
import {DeleteButtonComponent} from "./delete-button.component";
import {prepareTranslatedValue} from "../../../dynamic-component/common/translated-value.component";

export const COMMON_ACTIONS_CONTEXT = new InjectionToken<CommonActionsContext>('COMMON_ACTIONS_CONTEXT');

export interface CommonActionsContext<TItem = Object> {
  getViewLinkCommands(item: TItem): any[] | string;

  getEditLinkCommands(item: TItem): any[] | string;

  getItemNameForDelete(item: TItem): string | Changeable<string>;

  deleteIsDraft?(item: TItem): boolean;

  prepareDelete(item: TItem): Observable<unknown>;
}

type CommonActionColumnSpec = Pick<
  ColumnSpec,
  'header' | 'cellValue' | 'cellClass' | 'cellStyle' | 'excludeFromExport'
>;

export function prepareActionsColumnOptions(
  blueprints: MultipleComponentsCellComponent['blueprints'],
): CommonActionColumnSpec {
  const cellWidth = (3 * blueprints.length) + 0.2; // Add a bit for borders/gridlines

  return {
    header: prepareTranslatedValue('generic.actions'),
    cellValue: prepareMultipleComponentsCell(blueprints),

    cellClass: () => of('p-0'),
    cellStyle: () => of({'width': cellWidth + 'rem'}),

    excludeFromExport: true,
  };
}

/**
 * Ready to use column options (either directly or via spread).
 *
 * Important: requires providing COMMON_ACTIONS_CONTEXT outside
 * (e.g. on component that defines the columns).
 */
export const commonActionsColumnOptions: CommonActionColumnSpec = prepareActionsColumnOptions([
  {componentType: DetailsLinkComponent},
  {componentType: EditLinkComponent},
  {componentType: DeleteButtonComponent},
]);


type PrepareColumnActionsParams = {
  canManage$?: Observable<boolean>,

  canEdit$?: Observable<boolean>,
  canDelete$?: Observable<boolean>,
};

export function prepareCommonActionsColumnOptions(
  options: PrepareColumnActionsParams,
): ReturnType<typeof prepareActionsColumnOptions> {
  return prepareActionsColumnOptions([
    {componentType: DetailsLinkComponent},

    {
      blueprint: {componentType: EditLinkComponent},
      shouldDisplay: options.canEdit$ ?? options.canManage$,
    },
    {
      blueprint: {componentType: DeleteButtonComponent},
      shouldDisplay: options.canDelete$ ?? options.canManage$,
    },
  ]);
}
