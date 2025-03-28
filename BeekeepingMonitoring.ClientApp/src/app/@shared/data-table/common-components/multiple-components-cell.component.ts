import {DynamicComponentBlueprint} from "../../dynamic-component/dynamic-component.blueprint";
import {DT_ALL_MODEL_INPUT, DT_ROW_MODEL_INPUT, DtCellInputs} from "../common";
import {Component, Input} from "@angular/core";
import {CommonModule} from "@angular/common";
import {DynamicComponentOutletDirective} from "../../dynamic-component/dynamic-component-outlet.directive";
import {Observable} from "rxjs";

export function prepareMultipleComponentsCell(
  blueprints: MultipleComponentsCellComponent['blueprints'],
): DynamicComponentBlueprint<MultipleComponentsCellComponent> {
  return {
    componentType: MultipleComponentsCellComponent,
    initSetInputs: {
      [BLUEPRINTS_INPUT]: blueprints,
    },
  };
}

export const BLUEPRINTS_INPUT = 'blueprints';

export type MultipleComponentsCellBlueprint = DynamicComponentBlueprint<unknown, DtCellInputs>;

export type MultipleComponentsCellBlueprintSpec = {
  blueprint: MultipleComponentsCellBlueprint;

  /**
   * If undefined, assumed to be true (i.e. display unconditionally)
   */
  shouldDisplay?: Observable<boolean>;
};

type BlueprintOrSpec = MultipleComponentsCellBlueprint | MultipleComponentsCellBlueprintSpec;

@Component({
  standalone: true,
  imports: [
    CommonModule,
    DynamicComponentOutletDirective,
  ],
  template: `
    <ng-container *ngFor="let spec of coercedSpecs">
      <ng-container
        *ngIf="!spec.shouldDisplay || (spec.shouldDisplay | async)"
        [appDynamicComponentOutlet]="spec.blueprint"
        [optionalInputs]="getCellInputs()"
      />
    </ng-container>
  `,
  styles: [':host {display: contents}'],

  // Not CDS.OnPush because we want all change detection passes to be "proxied"
  // to the actual content components (and the DT itself is OnPush anyway).
})
export class MultipleComponentsCellComponent {
  @Input(BLUEPRINTS_INPUT)
  set blueprints(value: BlueprintOrSpec[]) {
    this.coercedSpecs = value
      .map(entry => {
        if (isBpSpec(entry)) return entry;

        return {
          blueprint: entry,
        };
      });
  }

  protected coercedSpecs: MultipleComponentsCellBlueprintSpec[] = [];

  @Input(DT_ROW_MODEL_INPUT)
  rowData?: any;

  @Input(DT_ALL_MODEL_INPUT)
  public rowModels: unknown[] = [];

  protected getCellInputs(): DtCellInputs {
    return {
      [DT_ROW_MODEL_INPUT]: this.rowData,
      [DT_ALL_MODEL_INPUT]: this.rowModels,
    };
  }
}

function isBpSpec(input: BlueprintOrSpec): input is MultipleComponentsCellBlueprintSpec {
  return 'blueprint' in input;
}
